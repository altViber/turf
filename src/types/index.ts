// ─── Ground ──────────────────────────────────────────────────────────────────

export type SurfaceType = 'grass' | 'artificial' | 'sand' | 'indoor';
export type AmenityType = 'parking' | 'toilets' | 'cafe' | 'shop' | 'bar' | 'changing_rooms' | 'floodlights';

export interface GroundAmenity {
  type: AmenityType;
  label: string;
}

export interface Ground {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  city: string;
  bundesland: string;
  capacity?: number;
  floodlights?: boolean;
  surface?: SurfaceType;
  isStadium: boolean;
  osmTags?: Record<string, string>;
  amenities?: GroundAmenity[];
}

// ─── Bookmark ────────────────────────────────────────────────────────────────

export interface Bookmark {
  id: string;
  groundId: string;
  groundData?: Ground | null; // cached OSM / static data
  createdAt: string;
}

// ─── Visit ───────────────────────────────────────────────────────────────────

export interface Photo {
  id: string;
  visitId: string;
  dataUrl: string; // signed URL from Supabase Storage, or base64 preview
  caption?: string | null;
  storagePath?: string;
  createdAt?: string;
}

export interface Visit {
  id: string;
  groundId: string;
  groundData?: Ground | null; // cached ground metadata
  date: string;
  note?: string | null;
  photos: Photo[];
  groupId?: string | null;
  companions?: string | null;
  createdAt: string;
}

// ─── Group ───────────────────────────────────────────────────────────────────

export type MemberRole = 'admin' | 'member';
export type PlaceType = 'station' | 'pub' | 'kiosk' | 'address' | 'other';

export interface GroupMember {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  role: MemberRole;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  emoji: string;
  color: string;
  members: GroupMember[];
  createdAt: string;
}

export interface MeetingPoint {
  id: string;
  label: string;
  type: PlaceType;
  address?: string;
  coordinates: { lat: number; lng: number };
}

export interface GroupEvent {
  id: string;
  groupId: string;
  groundId: string;
  groundData?: Ground | null; // cached ground metadata
  startDateTime: string;
  meetingPoint?: MeetingPoint;
  note?: string | null;
  createdAt: string;
  createdBy: string;
}

// ─── Place Search ─────────────────────────────────────────────────────────────

export interface PlaceSearchResult {
  id: string;
  label: string;
  type: PlaceType;
  address?: string;
  coordinates: { lat: number; lng: number };
}

// ─── Rail ────────────────────────────────────────────────────────────────────

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  bundesland: string;
  lineIds: string[];
}

export interface RailLine {
  id: string;
  name: string;       // "RE1"
  fullName: string;   // "RE1 Aachen – Hamm"
  bundesland: string;
  color: string;
  stationIds: string[];
  startStationId: string;
  endStationId: string;
  geometry: [number, number][]; // [lng, lat] GeoJSON order
}

export interface LineSegment {
  lineId: string;
  fromStationId: string;
  toStationId: string;
  coordinates: [number, number][];
}

export interface GroundAccessibility {
  stationId: string;
  groundId: string;
  minutesEstimate: number;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export type BadgeCategory = 'quantitative' | 'rail' | 'variety' | 'group' | 'documentation';

export type BadgeRequirementType =
  | 'visits_count'
  | 'bundesland_count'
  | 'rail_grounds'
  | 'floodlight_grounds'
  | 'large_stadium_grounds'
  | 'group_events'
  | 'group_visits'
  | 'photos_count';

export interface BadgeRequirement {
  type: BadgeRequirementType;
  threshold: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirement: BadgeRequirement;
}

export interface UserBadge {
  badgeId: string;
  unlockedAt: string;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface UserProfile {
  username: string;
  displayName: string;
  bio?: string;
  avatarInitials: string;
  joinedAt: string;
}
