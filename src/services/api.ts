/**
 * API client for the Supabase backend (Hono edge function).
 * All user-generated data is persisted here.
 */
import { projectId, publicAnonKey } from '/utils/supabase/info';
import type {
  Bookmark, Visit, Photo, Group, GroupEvent, UserProfile, Ground,
} from '../types';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-236b4a22`;

const AUTH_HEADERS = {
  Authorization: `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...AUTH_HEADERS, ...(opts?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${path}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Profile ──────────────────────────────────────────────────────────────────

export function getProfile(): Promise<UserProfile> {
  return req<UserProfile>('/profile');
}

export function updateProfile(data: UserProfile): Promise<UserProfile> {
  return req<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(data) });
}

// ── Bookmarks ────────────────────────────────────────────────────────────────

export function getBookmarks(): Promise<Bookmark[]> {
  return req<Bookmark[]>('/bookmarks');
}

export function createBookmark(groundId: string, groundData?: Ground | null): Promise<Bookmark> {
  return req<Bookmark>('/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ groundId, groundData }),
  });
}

export function deleteBookmark(groundId: string): Promise<{ ok: boolean }> {
  return req<{ ok: boolean }>(`/bookmarks/${encodeURIComponent(groundId)}`, { method: 'DELETE' });
}

// ── Visits ───────────────────────────────────────────────────────────────────

export function getVisits(): Promise<Visit[]> {
  return req<Visit[]>('/visits');
}

export function createVisit(data: {
  groundId: string;
  groundData?: Ground | null;
  date: string;
  note?: string | null;
  groupId?: string | null;
  companions?: string | null;
}): Promise<Visit> {
  return req<Visit>('/visits', { method: 'POST', body: JSON.stringify(data) });
}

// ── Photos ───────────────────────────────────────────────────────────────────

export async function uploadPhoto(
  visitId: string,
  file: File,
  caption?: string
): Promise<Photo> {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);

  const res = await fetch(`${BASE}/visits/${visitId}/photos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${publicAnonKey}` }, // no Content-Type – browser sets multipart
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Photo upload failed ${res.status}: ${text}`);
  }
  return res.json() as Promise<Photo>;
}

// ── Groups ───────────────────────────────────────────────────────────────────

export function getGroups(): Promise<Group[]> {
  return req<Group[]>('/groups');
}

export function createGroup(data: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
  return req<Group>('/groups', { method: 'POST', body: JSON.stringify(data) });
}

// ── Events ───────────────────────────────────────────────────────────────────

export function getEvents(): Promise<GroupEvent[]> {
  return req<GroupEvent[]>('/events');
}

export function createEvent(data: Omit<GroupEvent, 'id' | 'createdAt'>): Promise<GroupEvent> {
  return req<GroupEvent>('/events', { method: 'POST', body: JSON.stringify(data) });
}
