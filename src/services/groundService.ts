/**
 * GroundService — queries outdoor football grounds via the server-side
 * Overpass proxy (/overpass) rather than calling Overpass directly.
 *
 * Architecture
 * ───────────────────────────────────────────────────────────────────────────
 *  Browser  →  Supabase Edge Function (/overpass)  →  Overpass API
 *                  ↳ KV-cached 30 min (shared across all sessions)
 *                  ↳ 3-mirror fallback
 *                  ↳ serves stale cache on total failure
 *
 * In addition, this module keeps a local in-memory cache so that rapid
 * pan/zoom within the same rounded tile never hits the network at all.
 */
import type { Ground, SurfaceType } from '../types';
import { projectId, publicAnonKey } from '/utils/supabase/info';

// ── Constants ────────────────────────────────────────────────────────────────

const SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-236b4a22`;

/** Local memory-cache TTL (ms) — server KV cache owns the 30-min window. */
const LOCAL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

/**
 * Client-side timeout for the proxy fetch (ms).
 * Must be shorter than the Supabase Edge Function's 60-second hard limit.
 * 3 mirrors × 8 s each = 24 s max server time → give the client 30 s.
 */
const CLIENT_FETCH_TIMEOUT_MS = 30_000;

/** Round bbox coordinates to this step for the local cache key. */
const ROUND_STEP = 0.1;

// ── Local memory cache ───────────────────────────────────────────────────────

interface CacheEntry {
  data: Ground[];
  ts: number;
}

const localCache = new Map<string, CacheEntry>();

function cacheKey(s: number, w: number, n: number, e: number): string {
  const r = (v: number) => (Math.round(v / ROUND_STEP) * ROUND_STEP).toFixed(1);
  return `${r(s)},${r(w)},${r(n)},${r(e)}`;
}

// ── OSM element → Ground ─────────────────────────────────────────────────────

function parseSurface(s?: string): SurfaceType | undefined {
  if (!s) return undefined;
  const l = s.toLowerCase();
  if (l === 'grass' || l === 'turf') return 'grass';
  if (
    l.includes('artificial') ||
    l === 'astroturf' ||
    l === 'synthetic' ||
    l === '3g' ||
    l === '4g'
  )
    return 'artificial';
  if (l === 'sand') return 'sand';
  return undefined;
}

function osmElementToGround(el: Record<string, unknown>): Ground | null {
  const tags = (el.tags as Record<string, string>) ?? {};
  const sport   = tags['sport'];
  const leisure = tags['leisure'];

  if (!['soccer', 'football'].includes(sport   ?? '')) return null;
  if (!['pitch',  'stadium' ].includes(leisure ?? '')) return null;

  // Exclude indoor
  if (tags['indoor'] === 'yes' || tags['location'] === 'indoor') return null;

  const center = el.center as { lat: number; lon: number } | undefined;
  const lat = (el.lat as number) ?? center?.lat;
  const lon = (el.lon as number) ?? center?.lon;
  if (!lat || !lon) return null;

  const type = el.type as string;
  const id   = `${type}/${el.id}`;

  const name =
    tags['name'] ||
    tags['name:de'] ||
    tags['name:en'] ||
    (leisure === 'stadium' ? 'Stadion' : 'Sportplatz');

  const rawCap  = tags['capacity'] ? parseInt(tags['capacity'], 10) : undefined;
  const capacity = rawCap !== undefined && !isNaN(rawCap) ? rawCap : undefined;

  const hasFloodlights =
    tags['floodlight'] === 'yes' ||
    tags['floodlights'] === 'yes' ||
    tags['lit'] === 'yes';

  return {
    id,
    name,
    lat,
    lng: lon,
    city:
      tags['addr:city'] ||
      tags['addr:town'] ||
      tags['addr:municipality'] ||
      tags['addr:village'] ||
      '',
    bundesland: tags['addr:state'] || '',
    address: tags['addr:street']
      ? `${tags['addr:street']}${tags['addr:housenumber'] ? ' ' + tags['addr:housenumber'] : ''}`.trim()
      : undefined,
    capacity,
    floodlights: hasFloodlights || undefined,
    surface: parseSurface(tags['surface']),
    isStadium: leisure === 'stadium',
    osmTags: {
      leisure: tags['leisure'],
      sport:   tags['sport'],
      ...(tags['surface']    ? { surface:    tags['surface']    } : {}),
      ...(tags['capacity']   ? { capacity:   tags['capacity']   } : {}),
      ...(tags['floodlight'] ? { floodlight: tags['floodlight'] } : {}),
      ...(tags['lit']        ? { lit:        tags['lit']        } : {}),
    },
  } satisfies Ground;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch outdoor football grounds for the given bounding box.
 *
 * 1. Returns from the local in-memory cache if fresh (10 min).
 * 2. Otherwise calls the server-side proxy, which handles:
 *    - bbox clamping to 0.2° × 0.2°
 *    - 30-minute KV cache shared across sessions
 *    - 3-mirror Overpass fallback
 *    - stale-while-error
 */
export async function fetchGrounds(
  south: number,
  west: number,
  north: number,
  east: number,
): Promise<Ground[]> {
  const key = cacheKey(south, west, north, east);
  const hit = localCache.get(key);
  if (hit && Date.now() - hit.ts < LOCAL_CACHE_TTL_MS) {
    return hit.data;
  }

  const params = new URLSearchParams({
    south: String(south),
    west:  String(west),
    north: String(north),
    east:  String(east),
  });

  // Abort the fetch if it takes longer than CLIENT_FETCH_TIMEOUT_MS.
  // This guards against the Supabase Edge Function being killed mid-request
  // (which would cause the browser to throw TypeError: Failed to fetch).
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${SERVER_BASE}/overpass?${params}`, {
      headers: { Authorization: `Bearer ${publicAnonKey}` },
      signal: controller.signal,
    });
  } catch (networkErr) {
    // Network error or timeout — return stale local cache or empty array.
    // The map already shows seed data so this is non-fatal.
    console.warn('Overpass proxy unreachable (network error):', networkErr);
    const stale = localCache.get(key);
    return stale ? stale.data : [];
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    // 503 means proxy also ran out of options — return stale local cache or []
    const stale = localCache.get(key);
    if (stale) return stale.data;
    console.warn(`Overpass proxy returned ${res.status} ${res.statusText}`);
    return [];
  }

  const json = (await res.json()) as { elements?: Record<string, unknown>[]; error?: string };

  if (json.error) {
    const stale = localCache.get(key);
    if (stale) return stale.data;
    console.warn(`Overpass proxy error: ${json.error}`);
    return [];
  }

  const grounds: Ground[] = [];
  for (const el of json.elements ?? []) {
    const g = osmElementToGround(el);
    if (g) grounds.push(g);
  }

  // De-duplicate by id
  const seen   = new Set<string>();
  const unique = grounds.filter((g) => {
    if (seen.has(g.id)) return false;
    seen.add(g.id);
    return true;
  });

  localCache.set(key, { data: unique, ts: Date.now() });
  return unique;
}

// ── Rail Mode helpers ────────────────────────────────────────────────────────

/**
 * Haversine distance in km between two lat/lng points.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R     = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat  = toRad(lat2 - lat1);
  const dLng  = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * The 30-minute rule: a ground is reachable from any station within MAX_REACH_KM.
 * 3.5 km ≈ 30 min walking at ~7 km/h, or ~15 min by tram from a station.
 */
export const MAX_REACH_KM = 3.5;