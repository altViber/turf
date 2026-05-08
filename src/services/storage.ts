import type {
  Bookmark, Visit, Photo, Group, GroupEvent, UserProfile, Ground,
} from '../types';

const KEYS = {
  profile: 'turf_profile',
  bookmarks: 'turf_bookmarks',
  visits: 'turf_visits',
  groups: 'turf_groups',
  events: 'turf_events',
} as const;

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function getProfile(defaultProfile: UserProfile): UserProfile {
  return load<UserProfile>(KEYS.profile, defaultProfile);
}

export function updateProfile(data: UserProfile): UserProfile {
  save(KEYS.profile, data);
  return data;
}

// ── Bookmarks ────────────────────────────────────────────────────────────────

export function getBookmarks(): Bookmark[] {
  return load<Bookmark[]>(KEYS.bookmarks, []);
}

export function createBookmark(groundId: string, groundData?: Ground | null): Bookmark {
  const bookmarks = getBookmarks();
  const bookmark: Bookmark = {
    id: uid(),
    groundId,
    groundData: groundData ?? null,
    createdAt: new Date().toISOString(),
  };
  bookmarks.push(bookmark);
  save(KEYS.bookmarks, bookmarks);
  return bookmark;
}

export function deleteBookmark(groundId: string): void {
  const bookmarks = getBookmarks().filter((b) => b.groundId !== groundId);
  save(KEYS.bookmarks, bookmarks);
}

// ── Visits ───────────────────────────────────────────────────────────────────

export function getVisits(): Visit[] {
  return load<Visit[]>(KEYS.visits, []);
}

export function createVisit(data: {
  groundId: string;
  groundData?: Ground | null;
  date: string;
  note?: string | null;
  groupId?: string | null;
  companions?: string | null;
}): Visit {
  const visits = getVisits();
  const visit: Visit = {
    id: uid(),
    ...data,
    photos: [],
    createdAt: new Date().toISOString(),
  };
  visits.push(visit);
  save(KEYS.visits, visits);
  return visit;
}

export function addPhotoToVisit(visitId: string, dataUrl: string, caption?: string): Photo {
  const visits = getVisits();
  const photo: Photo = {
    id: uid(),
    visitId,
    dataUrl,
    caption: caption ?? null,
    createdAt: new Date().toISOString(),
  };
  const idx = visits.findIndex((v) => v.id === visitId);
  if (idx !== -1) {
    visits[idx].photos.push(photo);
    save(KEYS.visits, visits);
  }
  return photo;
}

// ── Groups ───────────────────────────────────────────────────────────────────

export function getGroups(): Group[] {
  return load<Group[]>(KEYS.groups, []);
}

export function createGroup(data: Omit<Group, 'id' | 'createdAt'>): Group {
  const groups = getGroups();
  const group: Group = {
    id: uid(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  groups.push(group);
  save(KEYS.groups, groups);
  return group;
}

// ── Events ───────────────────────────────────────────────────────────────────

export function getEvents(): GroupEvent[] {
  return load<GroupEvent[]>(KEYS.events, []);
}

export function createEvent(data: Omit<GroupEvent, 'id' | 'createdAt'>): GroupEvent {
  const events = getEvents();
  const event: GroupEvent = {
    id: uid(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  events.push(event);
  save(KEYS.events, events);
  return event;
}

// ── Utility ──────────────────────────────────────────────────────────────────

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
