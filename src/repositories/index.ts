/**
 * Repository layer — mocked in-memory persistence.
 * Each repository exposes a simple interface backed by React state (managed in AppContext).
 */

import type {
  Bookmark, Visit, Photo, Group, GroupEvent, GroupMember,
  UserProfile, UserBadge, Badge,
} from '../types';
import { grounds } from '../data/grounds';
import { badgeDefinitions } from '../data/badgeDefinitions';

// ─── Seed data ────────────────────────────────────────────────────────────────

export const seedGroups: Group[] = [
  {
    id: 'grp1',
    name: 'Sunday League Crew',
    description: 'Exploring German lower leagues every weekend',
    emoji: '⚽',
    color: '#16a34a',
    createdAt: '2025-09-01T10:00:00Z',
    members: [
      { id: 'm1', name: 'Max Müller', avatarInitials: 'MM', avatarColor: '#16a34a', role: 'admin' },
      { id: 'm2', name: 'Jana Bauer', avatarInitials: 'JB', avatarColor: '#2563eb', role: 'member' },
      { id: 'm3', name: 'Tobias Koch', avatarInitials: 'TK', avatarColor: '#dc2626', role: 'member' },
      { id: 'm4', name: 'Sara Braun', avatarInitials: 'SB', avatarColor: '#7c3aed', role: 'member' },
    ],
  },
  {
    id: 'grp2',
    name: 'Bahnsteig Hoppers',
    description: 'Only travel by RE — max 30 min from station',
    emoji: '🚆',
    color: '#2563eb',
    createdAt: '2025-11-15T09:00:00Z',
    members: [
      { id: 'm1', name: 'Max Müller', avatarInitials: 'MM', avatarColor: '#16a34a', role: 'admin' },
      { id: 'm5', name: 'Felix Wagner', avatarInitials: 'FW', avatarColor: '#0891b2', role: 'member' },
      { id: 'm6', name: 'Lena Schulz', avatarInitials: 'LS', avatarColor: '#ea580c', role: 'member' },
    ],
  },
];

export const seedEvents: GroupEvent[] = [
  {
    id: 'ev1',
    groupId: 'grp1',
    groundId: 'g-gruenwalder',
    startDateTime: '2026-03-02T14:00:00Z',
    meetingPoint: {
      id: 'mp1', label: 'U3 Haltestelle Giesing', type: 'station',
      address: 'Tegernseer Landstraße, München', coordinates: { lat: 48.1127, lng: 11.5612 },
    },
    note: 'Classic Bavarian ground – cash only at the Kiosk!',
    createdAt: '2026-02-15T10:00:00Z',
    createdBy: 'm1',
  },
  {
    id: 'ev2',
    groupId: 'grp1',
    groundId: 'g-max-morlock',
    startDateTime: '2026-03-22T15:30:00Z',
    createdAt: '2026-02-20T10:00:00Z',
    createdBy: 'm2',
  },
  {
    id: 'ev3',
    groupId: 'grp2',
    groundId: 'g-signal-iduna',
    startDateTime: '2026-03-07T15:30:00Z',
    meetingPoint: {
      id: 'mp2', label: 'Dortmund Hbf Haupteingang', type: 'station',
      address: 'Strobelallee 50, Dortmund', coordinates: { lat: 51.5187, lng: 7.4591 },
    },
    note: 'RE11 from Düsseldorf – 35 min ride',
    createdAt: '2026-02-22T10:00:00Z',
    createdBy: 'm1',
  },
  {
    id: 'ev4',
    groupId: 'grp1',
    groundId: 'g-volksparkstadion',
    startDateTime: '2026-02-01T13:00:00Z',
    createdAt: '2026-01-20T10:00:00Z',
    createdBy: 'm1',
  },
];

export const seedVisits: Visit[] = [
  {
    id: 'v1',
    groundId: 'g-allianz-arena',
    date: '2025-10-19',
    note: 'Incredible atmosphere, Bayern vs. Dortmund',
    photos: [],
    groupId: 'grp1',
    companions: 'Jana, Tobias',
    createdAt: '2025-10-19T18:00:00Z',
  },
  {
    id: 'v2',
    groundId: 'g-signal-iduna',
    date: '2025-11-08',
    note: 'Yellow Wall was unreal',
    photos: [],
    createdAt: '2025-11-08T16:00:00Z',
  },
  {
    id: 'v3',
    groundId: 'g-gruenwalder',
    date: '2025-12-14',
    note: 'Old school Bavarian lower league',
    photos: [],
    companions: 'Felix',
    createdAt: '2025-12-14T15:00:00Z',
  },
];

export const seedBookmarks: Bookmark[] = [
  { id: 'bm1', groundId: 'g-allianz-arena', createdAt: '2025-10-01T10:00:00Z' },
  { id: 'bm2', groundId: 'g-signal-iduna', createdAt: '2025-10-05T10:00:00Z' },
  { id: 'bm3', groundId: 'g-gruenwalder', createdAt: '2025-11-01T10:00:00Z' },
  { id: 'bm4', groundId: 'g-millerntor', createdAt: '2025-11-20T10:00:00Z' },
];

export const seedProfile: UserProfile = {
  username: 'maxmueller',
  displayName: 'Max Müller',
  bio: 'Groundhopping across Germany by rail since 2018 🚆⚽',
  avatarInitials: 'MM',
  joinedAt: '2018-04-01T00:00:00Z',
};

// ─── Badge computation ────────────────────────────────────────────────────────

export function computeUnlockedBadges(
  visits: Visit[],
  groups: Group[],
  events: GroupEvent[],
  allGrounds: typeof grounds,
): UserBadge[] {
  const unlocked: UserBadge[] = [];
  const visitedGroundIds = new Set(visits.map((v) => v.groundId));

  const getVisitedGrounds = () =>
    allGrounds.filter((g) => visitedGroundIds.has(g.id));

  const check = (badge: Badge): boolean => {
    const { type, threshold } = badge.requirement;
    switch (type) {
      case 'visits_count':
        return visitedGroundIds.size >= threshold;
      case 'bundesland_count': {
        const bl = new Set(getVisitedGrounds().map((g) => g.bundesland));
        return bl.size >= threshold;
      }
      case 'rail_grounds': {
        // Rail grounds = grounds that have at least one accessibility entry ≤ 30
        const railGroundIds = new Set(
          allGrounds.filter((g) => g.id.startsWith('g-')).map((g) => g.id)
        );
        const visited = getVisitedGrounds().filter((g) => railGroundIds.has(g.id));
        return visited.length >= threshold;
      }
      case 'floodlight_grounds': {
        const visited = getVisitedGrounds().filter((g) => g.floodlights);
        return visited.length >= threshold;
      }
      case 'large_stadium_grounds': {
        const visited = getVisitedGrounds().filter(
          (g) => g.isStadium && (g.capacity ?? 0) > 10000
        );
        return visited.length >= threshold;
      }
      case 'group_events':
        return events.length >= threshold;
      case 'group_visits': {
        const gv = visits.filter((v) => v.groupId).length;
        return gv >= threshold;
      }
      case 'photos_count': {
        const pc = visits.reduce((acc, v) => acc + v.photos.length, 0);
        return pc >= threshold;
      }
      default:
        return false;
    }
  };

  for (const badge of badgeDefinitions) {
    if (check(badge)) {
      unlocked.push({ badgeId: badge.id, unlockedAt: new Date().toISOString() });
    }
  }
  return unlocked;
}

// Re-export for convenience
export type { UserProfile };
