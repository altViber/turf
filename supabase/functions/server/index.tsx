import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();
const PREFIX = "/make-server-236b4a22";
const BUCKET_NAME = "make-236b4a22-photos";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Idempotently create storage bucket
async function initStorage() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET_NAME);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME);
    if (error) console.log("Bucket creation error:", error.message);
    else console.log("Storage bucket created:", BUCKET_NAME);
  }
}
initStorage().catch((e) => console.log("Storage init failed:", e));

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ── Health ─────────────────────────��─────────────────────────────────────────
app.get(`${PREFIX}/health`, (c) => c.json({ status: "ok" }));

// ── Overpass proxy ────────────────────────────────────────────────────────────
/**
 * GET /overpass?south=&west=&north=&east=
 *
 * Server-side proxy for the Overpass API.
 * - Clamps bbox to MAX_DEG × MAX_DEG before querying.
 * - Caches results in KV for 30 minutes (shared across all browser sessions).
 * - Returns stale cache when every Overpass mirror fails.
 * - Tries two mirrors in sequence so a single overloaded server doesn't block.
 */
const OVERPASS_MAX_DEG = 0.2;          // ~22 km span per axis
const OVERPASS_CACHE_TTL = 30 * 60 * 1000; // 30 min
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Per-mirror timeout in ms.
// 3 mirrors × 8 s = 24 s max — well within Supabase's 60-second function limit.
const MIRROR_TIMEOUT_MS = 8_000;

function clampAxis(lo: number, hi: number, max: number): [number, number] {
  const span = hi - lo;
  if (span <= max) return [lo, hi];
  const mid = (lo + hi) / 2;
  return [mid - max / 2, mid + max / 2];
}

function overpassCacheKey(s: number, w: number, n: number, e: number): string {
  const r = (v: number) => (Math.round(v / 0.1) * 0.1).toFixed(1);
  return `ovp-${r(s)}-${r(w)}-${r(n)}-${r(e)}`;
}

app.get(`${PREFIX}/overpass`, async (c) => {
  const qs = c.req.query();
  const south = parseFloat(qs.south ?? "");
  const west  = parseFloat(qs.west  ?? "");
  const north = parseFloat(qs.north ?? "");
  const east  = parseFloat(qs.east  ?? "");

  if ([south, west, north, east].some(isNaN)) {
    return c.json({ error: "Missing or invalid bbox params (south, west, north, east)" }, 400);
  }

  // Clamp bbox server-side
  const [s, n] = clampAxis(south, north, OVERPASS_MAX_DEG);
  const [w, e] = clampAxis(west,  east,  OVERPASS_MAX_DEG);
  const cacheKey = overpassCacheKey(s, w, n, e);

  // ── KV cache check ─────────────────────────────────────────────────────────
  let staleElements: unknown[] | null = null;
  try {
    const cached = await kv.get(cacheKey) as { elements: unknown[]; ts: number } | null;
    if (cached) {
      if (Date.now() - cached.ts < OVERPASS_CACHE_TTL) {
        console.log(`Overpass cache HIT for ${cacheKey}`);
        return c.json({ elements: cached.elements, fromCache: true });
      }
      staleElements = cached.elements; // keep for fallback
    }
  } catch (kvErr) {
    console.log("KV read error (non-fatal):", kvErr);
  }

  // ── Query Overpass ─────────────────────────────────────────────────────────
  const bbox = `${s},${w},${n},${e}`;
  // Simple equality checks (no regex) — fastest path on Overpass
  const query = `[out:json][timeout:18];
(
  nwr["leisure"="pitch"]["sport"="soccer"](${bbox});
  nwr["leisure"="pitch"]["sport"="football"](${bbox});
  nwr["leisure"="stadium"]["sport"="soccer"](${bbox});
  nwr["leisure"="stadium"]["sport"="football"](${bbox});
);
out center tags;`.trim();

  let elements: unknown[] | null = null;

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      console.log(`Trying Overpass mirror: ${mirror}`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), MIRROR_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(mirror, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) {
        console.log(`Mirror ${mirror} responded ${res.status} — trying next`);
        continue;
      }

      const json = await res.json() as { elements?: unknown[] };
      elements = json.elements ?? [];
      console.log(`Overpass OK from ${mirror}: ${elements.length} elements`);
      break;
    } catch (fetchErr) {
      console.log(`Mirror ${mirror} failed:`, fetchErr);
    }
  }

  // ── Persist to KV (best-effort) ────────────────────────────────────────────
  if (elements !== null) {
    try {
      await kv.set(cacheKey, { elements, ts: Date.now() });
    } catch (kvErr) {
      console.log("KV write error (non-fatal):", kvErr);
    }
    return c.json({ elements });
  }

  // ── All mirrors failed — serve stale cache if available ───────────────────
  if (staleElements !== null) {
    console.log(`All mirrors failed — returning stale cache for ${cacheKey}`);
    return c.json({ elements: staleElements, fromCache: true, stale: true });
  }

  return c.json({ error: "All Overpass mirrors failed and no cached data available" }, 503);
});

// ── Profile ──────────────────────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  username: "maxmueller",
  displayName: "Max Müller",
  bio: "Groundhopping across Germany by rail since 2018 🚆⚽",
  avatarInitials: "MM",
  joinedAt: "2018-04-01T00:00:00Z",
};

app.get(`${PREFIX}/profile`, async (c) => {
  try {
    const profile = await kv.get("profile");
    return c.json(profile ?? DEFAULT_PROFILE);
  } catch (e) {
    console.log("Error fetching profile:", e);
    return c.json(DEFAULT_PROFILE);
  }
});

app.put(`${PREFIX}/profile`, async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("profile", body);
    return c.json(body);
  } catch (e) {
    console.log("Error updating profile:", e);
    return c.json({ error: `Failed to update profile: ${e}` }, 500);
  }
});

// ── Bookmarks ────────────────────────────────────────────────────────────────
app.get(`${PREFIX}/bookmarks`, async (c) => {
  try {
    const bookmarks = await kv.getByPrefix("bm-");
    return c.json(bookmarks ?? []);
  } catch (e) {
    console.log("Error fetching bookmarks:", e);
    return c.json({ error: `Failed to fetch bookmarks: ${e}` }, 500);
  }
});

app.post(`${PREFIX}/bookmarks`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const bookmark = {
      id,
      groundId: body.groundId,
      groundData: body.groundData ?? null,
      createdAt: new Date().toISOString(),
    };
    await kv.set(id, bookmark);
    return c.json(bookmark, 201);
  } catch (e) {
    console.log("Error creating bookmark:", e);
    return c.json({ error: `Failed to create bookmark: ${e}` }, 500);
  }
});

app.delete(`${PREFIX}/bookmarks/:groundId`, async (c) => {
  try {
    const groundId = decodeURIComponent(c.req.param("groundId"));
    const bookmarks = (await kv.getByPrefix("bm-")) as Record<string, unknown>[];
    const toDelete = (bookmarks ?? []).find(
      (b) => (b as { groundId: string }).groundId === groundId
    ) as { id: string } | undefined;
    if (toDelete) await kv.del(toDelete.id);
    return c.json({ ok: true });
  } catch (e) {
    console.log("Error deleting bookmark:", e);
    return c.json({ error: `Failed to delete bookmark: ${e}` }, 500);
  }
});

// ── Visits ───────────────────────────────────────────────────────────────────
app.get(`${PREFIX}/visits`, async (c) => {
  try {
    const visits = ((await kv.getByPrefix("visit-")) as Record<string, unknown>[]) ?? [];
    const photos = ((await kv.getByPrefix("photo-")) as Record<string, unknown>[]) ?? [];
    const result = visits.map((v) => ({
      ...v,
      photos: photos.filter(
        (p) => (p as { visitId: string }).visitId === (v as { id: string }).id
      ),
    }));
    return c.json(result);
  } catch (e) {
    console.log("Error fetching visits:", e);
    return c.json({ error: `Failed to fetch visits: ${e}` }, 500);
  }
});

app.post(`${PREFIX}/visits`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `visit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const visit = {
      id,
      groundId: body.groundId,
      groundData: body.groundData ?? null,
      date: body.date,
      note: body.note ?? null,
      groupId: body.groupId ?? null,
      companions: body.companions ?? null,
      photos: [],
      createdAt: new Date().toISOString(),
    };
    await kv.set(id, visit);
    return c.json(visit, 201);
  } catch (e) {
    console.log("Error creating visit:", e);
    return c.json({ error: `Failed to create visit: ${e}` }, 500);
  }
});

// ── Photos ───────────────────────────────────────────────────────────────────
app.post(`${PREFIX}/visits/:visitId/photos`, async (c) => {
  try {
    const visitId = c.req.param("visitId");
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return c.json({ error: "No file field in form data" }, 400);

    const photoId = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const storagePath = `photos/${visitId}/${photoId}.${ext}`;

    const buffer = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, { contentType: file.type || "image/jpeg" });

    if (uploadErr) {
      console.log("Photo upload error:", uploadErr.message);
      return c.json({ error: `Storage upload failed: ${uploadErr.message}` }, 500);
    }

    const { data: signedData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 30); // 30 days

    const photo = {
      id: photoId,
      visitId,
      storagePath,
      dataUrl: signedData?.signedUrl ?? "",
      caption: (formData.get("caption") as string) ?? null,
      createdAt: new Date().toISOString(),
    };
    await kv.set(photoId, photo);
    return c.json(photo, 201);
  } catch (e) {
    console.log("Error uploading photo:", e);
    return c.json({ error: `Failed to upload photo: ${e}` }, 500);
  }
});

// ── Groups ───────────────────────────────────────────────────────────────────
app.get(`${PREFIX}/groups`, async (c) => {
  try {
    const groups = await kv.getByPrefix("grp-");
    return c.json(groups ?? []);
  } catch (e) {
    console.log("Error fetching groups:", e);
    return c.json({ error: `Failed to fetch groups: ${e}` }, 500);
  }
});

app.post(`${PREFIX}/groups`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const group = { id, ...body, createdAt: new Date().toISOString() };
    await kv.set(id, group);
    return c.json(group, 201);
  } catch (e) {
    console.log("Error creating group:", e);
    return c.json({ error: `Failed to create group: ${e}` }, 500);
  }
});

// ── Events ───────────────────────────────────────────────────────────────────
app.get(`${PREFIX}/events`, async (c) => {
  try {
    const events = await kv.getByPrefix("ev-");
    return c.json(events ?? []);
  } catch (e) {
    console.log("Error fetching events:", e);
    return c.json({ error: `Failed to fetch events: ${e}` }, 500);
  }
});

app.post(`${PREFIX}/events`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const event = { id, ...body, createdAt: new Date().toISOString() };
    await kv.set(id, event);
    return c.json(event, 201);
  } catch (e) {
    console.log("Error creating event:", e);
    return c.json({ error: `Failed to create event: ${e}` }, 500);
  }
});

Deno.serve(app.fetch);