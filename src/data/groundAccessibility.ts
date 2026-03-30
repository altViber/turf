import type { GroundAccessibility } from '../types';

// Mocked GroundAccessibility: stationId → groundId with minutesEstimate
// Only entries where minutesEstimate <= 30 are reachable in Rail Mode
export const groundAccessibility: GroundAccessibility[] = [
  // ── München Hbf ──────────────────────────────────────────────────────────────
  { stationId: 'st-muc-hbf', groundId: 'g-allianz-arena',         minutesEstimate: 25 },
  { stationId: 'st-muc-hbf', groundId: 'g-gruenwalder',           minutesEstimate: 22 },
  { stationId: 'st-muc-hbf', groundId: 'g-sportpark-unterhaching', minutesEstimate: 28 },

  // ── München Pasing ────────────────────────────────────────────────────────────
  { stationId: 'st-muc-pasing', groundId: 'g-allianz-arena',          minutesEstimate: 28 },
  { stationId: 'st-muc-pasing', groundId: 'g-gruenwalder',            minutesEstimate: 30 },
  { stationId: 'st-muc-pasing', groundId: 'g-germering-sportplatz',   minutesEstimate: 18 },

  // ── München Ostbahnhof ────────────────────────────────────────────────────────
  { stationId: 'st-muc-ostbhf', groundId: 'g-allianz-arena',          minutesEstimate: 30 },
  { stationId: 'st-muc-ostbhf', groundId: 'g-gruenwalder',            minutesEstimate: 15 },

  // ── Rosenheim ─────────────────────────────────────────────────────────────────
  { stationId: 'st-rosenheim', groundId: 'g-rosenheim',               minutesEstimate: 10 },

  // ── Augsburg Hbf ──────────────────────────────────────────────────────────────
  { stationId: 'st-augsburg', groundId: 'g-wwk-arena',                minutesEstimate: 12 },
  { stationId: 'st-augsburg', groundId: 'g-sportpark-unterhaching',   minutesEstimate: 30 },

  // ── Kaufering ─────────────────────────────────────────────────────────────────
  { stationId: 'st-kaufering', groundId: 'g-landsberg-sportpark',     minutesEstimate: 15 },
  { stationId: 'st-kaufering', groundId: 'g-wwk-arena',               minutesEstimate: 25 },

  // ── Nürnberg Hbf ──────────────────────────────────────────────────────────────
  { stationId: 'st-nuernberg', groundId: 'g-max-morlock',             minutesEstimate: 15 },

  // ── Ingolstadt Hbf ────────────────────────────────────────────────────────────
  { stationId: 'st-ingolstadt', groundId: 'g-muc-ingolstadt-pitch',   minutesEstimate: 20 },

  // ── Köln Hbf ──────────────────────────────────────────────────────────────────
  { stationId: 'st-koeln', groundId: 'g-rhein-energie',               minutesEstimate: 20 },
  { stationId: 'st-koeln', groundId: 'g-bayarena',                    minutesEstimate: 28 },

  // ── Leverkusen Mitte ──────────────────────────────────────────────────────────
  { stationId: 'st-leverkusen', groundId: 'g-bayarena',               minutesEstimate: 8  },
  { stationId: 'st-leverkusen', groundId: 'g-rhein-energie',          minutesEstimate: 15 },

  // ── Düsseldorf Hbf ────────────────────────────────────────────────────────────
  { stationId: 'st-duesseldorf', groundId: 'g-merkur-arena',          minutesEstimate: 12 },
  { stationId: 'st-duesseldorf', groundId: 'g-bayarena',              minutesEstimate: 20 },
  { stationId: 'st-duesseldorf', groundId: 'g-schauinsland',          minutesEstimate: 25 },
  { stationId: 'st-duesseldorf', groundId: 'g-krefeld-grotenburg',    minutesEstimate: 25 },

  // ── Duisburg Hbf ──────────────────────────────────────────────────────────────
  { stationId: 'st-duisburg', groundId: 'g-schauinsland',             minutesEstimate: 8  },
  { stationId: 'st-duisburg', groundId: 'g-bayarena',                 minutesEstimate: 20 },
  { stationId: 'st-duisburg', groundId: 'g-merkur-arena',             minutesEstimate: 15 },
  { stationId: 'st-duisburg', groundId: 'g-krefeld-grotenburg',       minutesEstimate: 28 },

  // ── Oberhausen Hbf ────────────────────────────────────────────────────────────
  { stationId: 'st-oberhausen', groundId: 'g-schauinsland',           minutesEstimate: 12 },
  { stationId: 'st-oberhausen', groundId: 'g-gelsenkirchen-veltins',  minutesEstimate: 15 },

  // ── Bochum Hbf ────────────────────────────────────────────────────────────────
  { stationId: 'st-bochum', groundId: 'g-rewirpower',                 minutesEstimate: 8  },
  { stationId: 'st-bochum', groundId: 'g-signal-iduna',               minutesEstimate: 25 },
  { stationId: 'st-bochum', groundId: 'g-gelsenkirchen-veltins',      minutesEstimate: 20 },

  // ── Dortmund Hbf ──────────────────────────────────────────────────────────────
  { stationId: 'st-dortmund', groundId: 'g-signal-iduna',             minutesEstimate: 10 },
  { stationId: 'st-dortmund', groundId: 'g-rewirpower',               minutesEstimate: 22 },

  // ── Hamm ──────────────────────────────────────────────────────────────────────
  { stationId: 'st-hamm', groundId: 'g-wersestadion',                 minutesEstimate: 18 },

  // ── Ahlen ─────────────────────────────────────────────────────────────────────
  { stationId: 'st-ahlen', groundId: 'g-wersestadion',                minutesEstimate: 5  },

  // ── Aachen Hbf ────────────────────────────────────────────────────────────────
  { stationId: 'st-aachen', groundId: 'g-tivoli',                     minutesEstimate: 12 },

  // ── Berlin Hbf ────────────────────────────────────────────────────────────────
  { stationId: 'st-berlin-hbf', groundId: 'g-olympiastadion-berlin',  minutesEstimate: 20 },
  { stationId: 'st-berlin-hbf', groundId: 'g-jahn-sportpark',         minutesEstimate: 22 },
  { stationId: 'st-berlin-hbf', groundId: 'g-alte-foersterei',        minutesEstimate: 28 },
  { stationId: 'st-berlin-hbf', groundId: 'g-charlottenburg-pitch',   minutesEstimate: 25 },

  // ── Berlin Ostbahnhof ─────────────────────────────────────────────────────────
  { stationId: 'st-berlin-ostbhf', groundId: 'g-alte-foersterei',     minutesEstimate: 20 },
  { stationId: 'st-berlin-ostbhf', groundId: 'g-olympiastadion-berlin', minutesEstimate: 30 },
  { stationId: 'st-berlin-ostbhf', groundId: 'g-jahn-sportpark',      minutesEstimate: 25 },
  { stationId: 'st-berlin-ostbhf', groundId: 'g-koepenick-pitch',     minutesEstimate: 22 },
  { stationId: 'st-berlin-ostbhf', groundId: 'g-neukoelln-pitch',     minutesEstimate: 20 },

  // ── Berlin Spandau ────────────────────────────────────────────────────────────
  { stationId: 'st-berlin-spandau', groundId: 'g-olympiastadion-berlin', minutesEstimate: 12 },
  { stationId: 'st-berlin-spandau', groundId: 'g-spandau-sportplatz',  minutesEstimate: 18 },
  { stationId: 'st-berlin-spandau', groundId: 'g-charlottenburg-pitch', minutesEstimate: 20 },

  // ── Potsdam Hbf ───────────────────────────────────────────────────────────────
  { stationId: 'st-potsdam', groundId: 'g-liebknecht-potsdam',        minutesEstimate: 10 },
  { stationId: 'st-potsdam', groundId: 'g-olympiastadion-berlin',     minutesEstimate: 30 },

  // ── Frankfurt (Oder) ──────────────────────────────────────────────────────────
  { stationId: 'st-ffo', groundId: 'g-ffo-oderfeld',                  minutesEstimate: 10 },
  { stationId: 'st-ffo', groundId: 'g-liebknecht-potsdam',            minutesEstimate: 55 }, // too far

  // ── Magdeburg Hbf ─────────────────────────────────────────────────────────────
  { stationId: 'st-magdeburg', groundId: 'g-avnet-arena',             minutesEstimate: 10 },
  { stationId: 'st-magdeburg', groundId: 'g-dessau-sportpark',        minutesEstimate: 30 },

  // ── Hamburg Hbf ───────────────────────────────────────────────────────────────
  { stationId: 'st-hamburg-hbf', groundId: 'g-volksparkstadion',      minutesEstimate: 20 },
  { stationId: 'st-hamburg-hbf', groundId: 'g-millerntor',            minutesEstimate: 15 },
  { stationId: 'st-hamburg-hbf', groundId: 'g-hamburg-wilhelmsburg',  minutesEstimate: 25 },
  { stationId: 'st-hamburg-hbf', groundId: 'g-hamburg-wandsbek',      minutesEstimate: 28 },

  // ── Hamburg-Altona ────────────────────────────────────────────────────────────
  { stationId: 'st-hamburg-altona', groundId: 'g-volksparkstadion',   minutesEstimate: 18 },
  { stationId: 'st-hamburg-altona', groundId: 'g-millerntor',         minutesEstimate: 20 },
  { stationId: 'st-hamburg-altona', groundId: 'g-hamburg-wilhelmsburg', minutesEstimate: 28 },

  // ── Kiel Hbf ──────────────────────────────────────────────────────────────────
  { stationId: 'st-kiel', groundId: 'g-holstein-kiel',                minutesEstimate: 10 },
  { stationId: 'st-kiel', groundId: 'g-neumuenster-ring',             minutesEstimate: 25 },

  // ── Flensburg ─────────────────────────────────────────────────────────────────
  { stationId: 'st-flensburg', groundId: 'g-flensburg-pitch',         minutesEstimate: 8  },

  // ── Rostock Hbf ───────────────────────────────────────────────────────────────
  { stationId: 'st-rostock', groundId: 'g-ostseestadion',             minutesEstimate: 12 },
  { stationId: 'st-rostock', groundId: 'g-greifswald',                minutesEstimate: 28 },

  // ── Stralsund Hbf ─────────────────────────────────────────────────────────────
  { stationId: 'st-stralsund', groundId: 'g-greifswald',              minutesEstimate: 28 },
  { stationId: 'st-stralsund', groundId: 'g-mv-ribnitz-pitch',        minutesEstimate: 22 },
];

// Filter to only reachable (≤ 30 min)
export const reachableAccessibility = groundAccessibility.filter(
  (ga) => ga.minutesEstimate <= 30
);

// Get reachable ground IDs for a set of station IDs
export function getReachableGroundIds(stationIds: Set<string>): Set<string> {
  const result = new Set<string>();
  for (const ga of reachableAccessibility) {
    if (stationIds.has(ga.stationId)) {
      result.add(ga.groundId);
    }
  }
  return result;
}
