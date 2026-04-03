import { haversineKm } from './groundService';
import { grounds as staticGrounds } from '../data/grounds';
import type { Ground } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MatchTeam {
  teamId: number;
  teamName: string;
  shortName: string;
  teamIconUrl: string;
}

export interface MatchResult {
  pointsTeam1: number;
  pointsTeam2: number;
  resultOrderID: number;   // 2 = final result
}

export interface Match {
  matchID: number;
  matchDateTime: string;
  leagueShortcut: string;
  leagueName: string;
  team1: MatchTeam;
  team2: MatchTeam;
  matchIsFinished: boolean;
  matchResults: MatchResult[];
  ground: Ground | null;
}

// ── Team → Ground mapping (2025/2026 season) ────────────────────────────────
// Maps OpenLigaDB teamId to the static ground id for their home venue.

const TEAM_GROUND_MAP: Record<number, string> = {
  // 1. Bundesliga 2025/2026
  40:   'g-allianz-arena',           // FC Bayern München
  7:    'g-signal-iduna',            // Borussia Dortmund
  6:    'g-bayarena',                // Bayer 04 Leverkusen
  1635: 'g-red-bull-arena',          // RB Leipzig
  91:   'g-deutsche-bank-park',      // Eintracht Frankfurt
  16:   'g-mhp-arena',              // VfB Stuttgart
  112:  'g-freiburg-europa',         // SC Freiburg
  131:  'g-vfl-wolfsburg',           // VfL Wolfsburg
  87:   'g-merkur-arena',            // Borussia Mönchengladbach
  134:  'g-weserstadion',            // SV Werder Bremen
  81:   'g-mewa-arena',              // 1. FSV Mainz 05
  175:  'g-prezero-arena',           // TSG Hoffenheim
  80:   'g-alte-foersterei',         // 1. FC Union Berlin
  95:   'g-wwk-arena',               // FC Augsburg
  98:   'g-millerntor',              // FC St. Pauli
  100:  'g-volksparkstadion',        // Hamburger SV (promoted to BL1)
  65:   'g-rhein-energie',           // 1. FC Köln (promoted to BL1)
  199:  'g-wwk-arena',               // 1. FC Heidenheim – placeholder, no dedicated ground

  // 2. Bundesliga 2025/2026
  9:    'g-gelsenkirchen-veltins',   // FC Schalke 04
  54:   'g-olympiastadion-berlin',   // Hertha BSC
  55:   'g-hdi-arena',              // Hannover 96
  79:   'g-max-morlock',             // 1. FC Nürnberg
  76:   'g-kaiserslautern-fritz-walter', // 1. FC Kaiserslautern
  74:   'g-braunschweig-eintracht',  // Eintracht Braunschweig
  105:  'g-wildparkstadion',         // Karlsruher SC
  31:   'g-paderborn-benteler',      // SC Paderborn 07
  188:  'g-muenster-preussenstadion', // Preußen Münster
  118:  'g-darmstadt-merck',         // SV Darmstadt 98
  174:  'g-brita-arena',            // SV Wehen Wiesbaden
  78:   'g-avnet-arena',             // 1. FC Magdeburg
  185:  'g-merkur-arena',            // Fortuna Düsseldorf – no dedicated ground, use Merkur Spiel-Arena
  115:  'g-sportpark-unterhaching',  // SpVgg Greuther Fürth – placeholder
  129:  'g-rewirpower',              // VfL Bochum (relegated to BL2)
  104:  'g-holstein-kiel',           // Holstein Kiel (relegated to BL2)
  177:  'g-rudolf-harbig',           // Dynamo Dresden (promoted to BL2)
  83:   'g-bielefeld-schueco',       // DSC Arminia Bielefeld (promoted to BL2)
  198:  'g-lcs-saarbruecken',        // SV 07 Elversberg – placeholder

  // 3. Liga 2025/2026
  125:  'g-gruenwalder',             // TSV 1860 München
  93:   'g-cottbus-energie',         // Energie Cottbus
  102:  'g-ostseestadion',           // Hansa Rostock
  36:   'g-osnabrueck-bremer',       // VfL Osnabrück
  23:   'g-tivoli',                  // Alemannia Aachen
  553:  'g-mannheim-carl-benz',      // SV Waldhof Mannheim
  171:  'g-muc-ingolstadt-pitch',    // FC Ingolstadt 04
  417:  'g-lcs-saarbruecken',        // 1. FC Saarbrücken
  564:  'g-ulm-donaustadion',        // SSV Ulm 1846
  181:  'g-regensburg-jahnstadion',  // Jahn Regensburg
  109:  'g-rewirpower',              // Rot-Weiss Essen – Stadion Essen, placeholder
  107:  'g-krefeld-grotenburg',      // MSV Duisburg – placeholder nearby
  184:  'g-mhp-arena',              // VfB Stuttgart II
  2199: 'g-rhein-energie',           // Viktoria Köln – Sportpark Höhenberg, placeholder
  116:  'g-sportpark-unterhaching',  // SpVgg Unterhaching
  114:  'g-paderborn-benteler',      // SC Verl – placeholder nearby
};

// ── Ground resolution ────────────────────────────────────────────────────────

/** Normalize string for fuzzy matching */
function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[-_.,/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ApiLocation {
  locationCity?: string;
  locationStadium?: string;
}

/**
 * Multi-tier ground resolution:
 * 1. TEAM_GROUND_MAP by team ID (most reliable)
 * 2. Stadium name match from API location data
 * 3. City name match from API location data
 */
function resolveGround(teamId: number, location?: ApiLocation | null): Ground | null {
  // Tier 1: Direct team mapping
  const groundId = TEAM_GROUND_MAP[teamId];
  if (groundId) {
    const g = staticGrounds.find((g) => g.id === groundId);
    if (g) return g;
  }

  if (!location) return null;

  // Tier 2: Match by stadium name
  if (location.locationStadium) {
    const needle = normalize(location.locationStadium);
    const byName = staticGrounds.find((g) => {
      const gName = normalize(g.name);
      return gName.includes(needle) || needle.includes(gName);
    });
    if (byName) return byName;
  }

  // Tier 3: Match by city name (pick the largest/most prominent ground in that city)
  if (location.locationCity) {
    const needle = normalize(location.locationCity);
    const inCity = staticGrounds.filter((g) => normalize(g.city) === needle);
    if (inCity.length > 0) {
      // Prefer stadiums, then highest capacity
      return inCity.sort((a, b) => {
        if (a.isStadium !== b.isStadium) return a.isStadium ? -1 : 1;
        return (b.capacity ?? 0) - (a.capacity ?? 0);
      })[0];
    }
  }

  return null;
}

// ── API fetching ─────────────────────────────────────────────────────────────

interface OpenLigaMatch {
  matchID: number;
  matchDateTime: string;
  leagueShortcut: string;
  leagueName: string;
  team1: { teamId: number; teamName: string; shortName: string; teamIconUrl: string };
  team2: { teamId: number; teamName: string; shortName: string; teamIconUrl: string };
  matchIsFinished: boolean;
  matchResults: { pointsTeam1: number; pointsTeam2: number; resultOrderID: number }[];
  location?: ApiLocation | null;
}

// Professional leagues (2025/2026 season = parameter 2025)
const PRO_LEAGUES: { shortcut: string; season: number }[] = [
  { shortcut: 'bl1', season: 2025 },
  { shortcut: 'bl2', season: 2025 },
  { shortcut: 'bl3', season: 2025 },
  { shortcut: 'dfb', season: 2025 },
];

// Amateur / lower division leagues available on OpenLigaDB
const AMATEUR_LEAGUES: { shortcut: string; season: number }[] = [
  { shortcut: 'rlno', season: 2025 },        // Regionalliga Nordost
  { shortcut: 'rlno_n', season: 2025 },       // Regionalliga Nordost (alt)
  { shortcut: 'RLW', season: 2024 },          // Regionalliga West
  { shortcut: 'OLW', season: 2024 },          // Oberliga Westfalen
  { shortcut: 'KADÜ', season: 2024 },         // Kreisliga A Düsseldorf
  { shortcut: 'Bezirksliga1', season: 2025 }, // Bezirksliga 1
  { shortcut: 'kr1', season: 2025 },          // Kreisliga West
  { shortcut: 'KL-Gr1-SW', season: 2025 },   // Kreisliga Schweinfurt GR1
  { shortcut: 'B5NF', season: 2025 },         // Kreisliga B5 Neckarfils
  { shortcut: 'Kreisliga A5', season: 2025 }, // Kreisliga A5 FVRHLD
  { shortcut: 'lk1', season: 2025 },          // Senioren Ü40
];

const ALL_LEAGUES = [...PRO_LEAGUES, ...AMATEUR_LEAGUES];

let cachedMatches: Match[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

async function fetchLeague(shortcut: string, season: number): Promise<OpenLigaMatch[]> {
  try {
    const res = await fetch(
      `https://api.openligadb.de/getmatchdata/${shortcut}/${season}`,
      { signal: AbortSignal.timeout(15_000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function fetchAllMatches(): Promise<Match[]> {
  const now = Date.now();
  if (cachedMatches && now - cacheTimestamp < CACHE_TTL) {
    return cachedMatches;
  }

  // Fetch pro leagues first (critical), amateur leagues best-effort
  const [proResults, amateurResults] = await Promise.all([
    Promise.all(PRO_LEAGUES.map((l) => fetchLeague(l.shortcut, l.season))),
    Promise.all(AMATEUR_LEAGUES.map((l) => fetchLeague(l.shortcut, l.season))),
  ]);

  const all = [...proResults.flat(), ...amateurResults.flat()];

  // Deduplicate by matchID (DFB-Pokal teams may overlap)
  const seen = new Set<number>();
  const unique: OpenLigaMatch[] = [];
  for (const m of all) {
    if (!seen.has(m.matchID)) {
      seen.add(m.matchID);
      unique.push(m);
    }
  }

  cachedMatches = unique.map((m) => ({
    matchID: m.matchID,
    matchDateTime: m.matchDateTime,
    leagueShortcut: m.leagueShortcut,
    leagueName: m.leagueName,
    team1: m.team1,
    team2: m.team2,
    matchIsFinished: m.matchIsFinished,
    matchResults: m.matchResults ?? [],
    ground: resolveGround(m.team1.teamId, m.location),
  }));

  cacheTimestamp = now;
  return cachedMatches;
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Get matches near a location within `radiusKm`. */
export async function getNearbyMatches(
  lat: number,
  lng: number,
  radiusKm = 50,
): Promise<Match[]> {
  const matches = await fetchAllMatches();
  return matches.filter((m) => {
    if (!m.ground) return false;
    return haversineKm(lat, lng, m.ground.lat, m.ground.lng) <= radiusKm;
  });
}

/** Get the user's current position via Geolocation API. */
export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 },
    );
  });
}
