import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type {
  Bookmark, Visit, Photo, Group, GroupEvent, MeetingPoint, UserProfile, UserBadge, Ground,
} from '../types';
import * as storage from '../services/storage';
import { badgeDefinitions } from '../data/badgeDefinitions';
import { grounds as staticGrounds } from '../data/grounds';
import { isAfter } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppContextType {
  loading: boolean;

  bookmarks: Bookmark[];
  addBookmark: (groundId: string, groundData?: Ground | null) => void;
  removeBookmark: (groundId: string) => void;
  isBookmarked: (groundId: string) => boolean;

  visits: Visit[];
  addVisit: (v: Omit<Visit, 'id' | 'createdAt' | 'photos'>) => Promise<string>;
  addPhotoToVisit: (visitId: string, file: File, caption?: string) => Promise<void>;

  groups: Group[];
  addGroup: (g: Omit<Group, 'id' | 'createdAt'>) => Promise<void>;

  events: GroupEvent[];
  addEvent: (e: Omit<GroupEvent, 'id' | 'createdAt'>) => Promise<void>;
  getGroupEvents: (groupId: string) => GroupEvent[];

  profile: UserProfile;
  updateProfile: (p: UserProfile) => Promise<void>;

  unlockedBadges: UserBadge[];

  stats: {
    totalGroundsVisited: number;
    bundeslaenderCount: number;
    railGroundsCount: number;
    totalPhotos: number;
    groupVisits: number;
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

// ── Default profile ───────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  username: 'maxmueller',
  displayName: 'Max Müller',
  bio: 'Groundhopping across Germany by rail since 2018 🚆⚽',
  avatarInitials: 'MM',
  joinedAt: '2018-04-01T00:00:00Z',
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => storage.getBookmarks());
  const [visits, setVisits] = useState<Visit[]>(() => storage.getVisits());
  const [groups, setGroups] = useState<Group[]>(() => storage.getGroups());
  const [events, setEvents] = useState<GroupEvent[]>(() => storage.getEvents());
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile(DEFAULT_PROFILE));

  // ── Bookmarks ────────────────────────────────────────────────────────────
  const addBookmark = useCallback((groundId: string, groundData?: Ground | null) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.groundId === groundId)) return prev;
      const created = storage.createBookmark(groundId, groundData);
      return [...prev, created];
    });
  }, []);

  const removeBookmark = useCallback((groundId: string) => {
    storage.deleteBookmark(groundId);
    setBookmarks((prev) => prev.filter((b) => b.groundId !== groundId));
  }, []);

  const isBookmarked = useCallback(
    (groundId: string) => bookmarks.some((b) => b.groundId === groundId),
    [bookmarks]
  );

  // ── Visits ───────────────────────────────────────────────────────────────
  const addVisit = useCallback(async (
    v: Omit<Visit, 'id' | 'createdAt' | 'photos'>
  ): Promise<string> => {
    const created = storage.createVisit({
      groundId: v.groundId,
      groundData: v.groundData,
      date: v.date,
      note: v.note,
      groupId: v.groupId,
      companions: v.companions,
    });
    setVisits((prev) => [...prev, created]);
    return created.id;
  }, []);

  const addPhotoToVisit = useCallback(async (
    visitId: string,
    file: File,
    caption?: string
  ): Promise<void> => {
    const dataUrl = await storage.fileToDataUrl(file);
    const photo = storage.addPhotoToVisit(visitId, dataUrl, caption);
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId ? { ...v, photos: [...v.photos, photo] } : v
      )
    );
  }, []);

  // ── Groups ───────────────────────────────────────────────────────────────
  const addGroup = useCallback(async (g: Omit<Group, 'id' | 'createdAt'>) => {
    const created = storage.createGroup(g);
    setGroups((prev) => [...prev, created]);
  }, []);

  // ── Events ───────────────────────────────────────────────────────────────
  const addEvent = useCallback(async (e: Omit<GroupEvent, 'id' | 'createdAt'>) => {
    const created = storage.createEvent(e);
    setEvents((prev) => [...prev, created]);
  }, []);

  const getGroupEvents = useCallback((groupId: string): GroupEvent[] => {
    const now = new Date();
    const groupEvs = events.filter((e) => e.groupId === groupId);
    const upcoming = groupEvs
      .filter((e) => isAfter(new Date(e.startDateTime), now))
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
    const past = groupEvs
      .filter((e) => !isAfter(new Date(e.startDateTime), now))
      .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime());
    return [...upcoming, ...past];
  }, [events]);

  // ── Profile ──────────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (p: UserProfile) => {
    storage.updateProfile(p);
    setProfile(p);
  }, []);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const visitedIds = new Set(visits.map((v) => v.groundId));

    const bundeslaender = new Set<string>();
    for (const v of visits) {
      const bl =
        v.groundData?.bundesland ||
        staticGrounds.find((g) => g.id === v.groundId)?.bundesland;
      if (bl) bundeslaender.add(bl);
    }

    const railVisitsCount = visits.filter((v) => {
      const g = v.groundData ?? staticGrounds.find((sg) => sg.id === v.groundId);
      return g?.isStadium || g?.floodlights;
    }).length;

    return {
      totalGroundsVisited: visitedIds.size,
      bundeslaenderCount: bundeslaender.size,
      railGroundsCount: railVisitsCount,
      totalPhotos: visits.reduce((acc, v) => acc + v.photos.length, 0),
      groupVisits: visits.filter((v) => v.groupId).length,
    };
  }, [visits]);

  // ── Badges ───────────────────────────────────────────────────────────────
  const unlockedBadges = useMemo((): UserBadge[] => {
    const visitedIds = new Set(visits.map((v) => v.groundId));
    const now = new Date().toISOString();

    const getVisited = () =>
      visits.map((v) => v.groundData ?? staticGrounds.find((g) => g.id === v.groundId)).filter(Boolean);

    const check = (type: string, threshold: number): boolean => {
      switch (type) {
        case 'visits_count': return visitedIds.size >= threshold;
        case 'bundesland_count': return stats.bundeslaenderCount >= threshold;
        case 'rail_grounds': return stats.railGroundsCount >= threshold;
        case 'floodlight_grounds': {
          const cnt = getVisited().filter((g) => g!.floodlights).length;
          return cnt >= threshold;
        }
        case 'large_stadium_grounds': {
          const cnt = getVisited().filter((g) => g!.isStadium && (g!.capacity ?? 0) > 10000).length;
          return cnt >= threshold;
        }
        case 'group_events': return events.length >= threshold;
        case 'group_visits': return stats.groupVisits >= threshold;
        case 'photos_count': return stats.totalPhotos >= threshold;
        default: return false;
      }
    };

    return badgeDefinitions
      .filter((b) => check(b.requirement.type, b.requirement.threshold))
      .map((b) => ({ badgeId: b.id, unlockedAt: now }));
  }, [visits, events, stats]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        loading: false,
        bookmarks, addBookmark, removeBookmark, isBookmarked,
        visits, addVisit, addPhotoToVisit,
        groups, addGroup,
        events, addEvent, getGroupEvents,
        profile, updateProfile,
        unlockedBadges,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
