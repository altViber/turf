import type { Station, RailLine } from '../types';

// ─── Stations ─────────────────────────────────────────────────────────────────

export const stations: Station[] = [
  // Bayern
  { id: 'st-muc-hbf',    name: 'München Hbf',       lat: 48.1402, lng: 11.5580, bundesland: 'Bayern',                  lineIds: ['rl-bay-re1', 'rl-bay-re7', 'rl-bay-re9'] },
  { id: 'st-muc-pasing', name: 'München Pasing',    lat: 48.1511, lng: 11.4627, bundesland: 'Bayern',                  lineIds: ['rl-bay-re7'] },
  { id: 'st-muc-ostbhf', name: 'München Ostbahnhof',lat: 48.1275, lng: 11.6016, bundesland: 'Bayern',                  lineIds: ['rl-bay-re1'] },
  { id: 'st-augsburg',   name: 'Augsburg Hbf',      lat: 48.3645, lng: 10.8851, bundesland: 'Bayern',                  lineIds: ['rl-bay-re7'] },
  { id: 'st-kaufering',  name: 'Kaufering',          lat: 48.0865, lng: 10.8776, bundesland: 'Bayern',                  lineIds: ['rl-bay-re7'] },
  { id: 'st-rosenheim',  name: 'Rosenheim',          lat: 47.8570, lng: 12.1213, bundesland: 'Bayern',                  lineIds: ['rl-bay-re1'] },
  { id: 'st-nuernberg',  name: 'Nürnberg Hbf',      lat: 49.4456, lng: 11.0824, bundesland: 'Bayern',                  lineIds: [] },
  { id: 'st-ingolstadt', name: 'Ingolstadt Hbf',    lat: 48.7660, lng: 11.4280, bundesland: 'Bayern',                  lineIds: ['rl-bay-re9'] },
  // NRW
  { id: 'st-koeln',      name: 'Köln Hbf',          lat: 50.9426, lng: 6.9584,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1', 'rl-nrw-re5'] },
  { id: 'st-dortmund',   name: 'Dortmund Hbf',      lat: 51.5187, lng: 7.4591,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1', 'rl-nrw-re11'] },
  { id: 'st-duesseldorf',name: 'Düsseldorf Hbf',    lat: 51.2195, lng: 6.7935,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1', 'rl-nrw-re11'] },
  { id: 'st-duisburg',   name: 'Duisburg Hbf',      lat: 51.4298, lng: 6.7742,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1', 'rl-nrw-re5'] },
  { id: 'st-bochum',     name: 'Bochum Hbf',        lat: 51.4782, lng: 7.2253,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1', 'rl-nrw-re11'] },
  { id: 'st-leverkusen', name: 'Leverkusen Mitte',  lat: 51.0354, lng: 6.9869,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re5'] },
  { id: 'st-aachen',     name: 'Aachen Hbf',        lat: 50.7680, lng: 6.0919,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1'] },
  { id: 'st-hamm',       name: 'Hamm (Westf)',       lat: 51.6786, lng: 7.8186,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1', 'rl-nrw-re11'] },
  { id: 'st-oberhausen', name: 'Oberhausen Hbf',    lat: 51.4721, lng: 6.8491,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re1', 'rl-nrw-re5'] },
  { id: 'st-emmerich',   name: 'Emmerich',           lat: 51.8367, lng: 6.2426,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re5'] },
  { id: 'st-ahlen',      name: 'Ahlen (Westf)',      lat: 51.7640, lng: 7.8924,  bundesland: 'Nordrhein-Westfalen',     lineIds: ['rl-nrw-re11'] },
  // Berlin / Brandenburg
  { id: 'st-berlin-hbf',    name: 'Berlin Hbf',       lat: 52.5251, lng: 13.3694, bundesland: 'Berlin',            lineIds: ['rl-ber-re1', 'rl-ber-re5'] },
  { id: 'st-berlin-ostbhf', name: 'Berlin Ostbahnhof',lat: 52.5100, lng: 13.4343, bundesland: 'Berlin',            lineIds: ['rl-ber-re1'] },
  { id: 'st-berlin-spandau', name: 'Berlin Spandau',  lat: 52.5353, lng: 13.1974, bundesland: 'Berlin',            lineIds: ['rl-ber-re1'] },
  { id: 'st-potsdam',    name: 'Potsdam Hbf',        lat: 52.3914, lng: 13.0684, bundesland: 'Brandenburg',        lineIds: ['rl-ber-re1'] },
  { id: 'st-magdeburg',  name: 'Magdeburg Hbf',      lat: 52.1306, lng: 11.6267, bundesland: 'Sachsen-Anhalt',     lineIds: ['rl-ber-re1'] },
  { id: 'st-ffo',        name: 'Frankfurt (Oder)',    lat: 52.3417, lng: 14.5502, bundesland: 'Brandenburg',        lineIds: ['rl-ber-re1'] },
  { id: 'st-stralsund',  name: 'Stralsund Hbf',      lat: 54.3168, lng: 13.0777, bundesland: 'Mecklenburg-Vorpommern', lineIds: ['rl-ber-re5'] },
  { id: 'st-rostock',    name: 'Rostock Hbf',        lat: 54.0792, lng: 12.1469, bundesland: 'Mecklenburg-Vorpommern', lineIds: ['rl-ber-re5'] },
  // Hamburg / SH
  { id: 'st-hamburg-hbf',   name: 'Hamburg Hbf',     lat: 53.5530, lng: 10.0062, bundesland: 'Hamburg',           lineIds: ['rl-hh-re7', 'rl-hh-re8'] },
  { id: 'st-hamburg-altona',name: 'Hamburg-Altona',   lat: 53.5503, lng: 9.9350,  bundesland: 'Hamburg',           lineIds: ['rl-hh-re7', 'rl-hh-re8'] },
  { id: 'st-kiel',       name: 'Kiel Hbf',           lat: 54.3145, lng: 10.1318, bundesland: 'Schleswig-Holstein', lineIds: ['rl-hh-re7', 'rl-hh-re8'] },
  { id: 'st-flensburg',  name: 'Flensburg',          lat: 54.7741, lng: 9.4369,  bundesland: 'Schleswig-Holstein', lineIds: ['rl-hh-re7'] },
];

// ─── Rail Lines ───────────────────────────────────────────────────────────────

export const railLines: RailLine[] = [
  // ── Bayern ──
  {
    id: 'rl-bay-re1',
    name: 'RE1',
    fullName: 'RE1 München – Rosenheim',
    bundesland: 'Bayern',
    color: '#E30613',
    stationIds: ['st-muc-hbf', 'st-muc-ostbhf', 'st-rosenheim'],
    startStationId: 'st-muc-hbf',
    endStationId: 'st-rosenheim',
    geometry: [
      [11.558, 48.140], [11.580, 48.135], [11.600, 48.128],
      [11.650, 48.115], [11.720, 48.095], [11.800, 48.062],
      [11.880, 48.020], [11.960, 47.975], [12.045, 47.925],
      [12.100, 47.890], [12.121, 47.857],
    ],
  },
  {
    id: 'rl-bay-re7',
    name: 'RE7',
    fullName: 'RE7 München – Augsburg',
    bundesland: 'Bayern',
    color: '#0066B3',
    stationIds: ['st-muc-hbf', 'st-muc-pasing', 'st-kaufering', 'st-augsburg'],
    startStationId: 'st-muc-hbf',
    endStationId: 'st-augsburg',
    geometry: [
      [11.558, 48.140], [11.500, 48.148], [11.463, 48.151],
      [11.380, 48.138], [11.260, 48.110], [11.150, 48.092],
      [11.030, 48.082], [10.910, 48.080], [10.878, 48.087],
      [10.872, 48.180], [10.873, 48.270], [10.885, 48.365],
    ],
  },
  {
    id: 'rl-bay-re9',
    name: 'RE9',
    fullName: 'RE9 Ingolstadt – München',
    bundesland: 'Bayern',
    color: '#8B4513',
    stationIds: ['st-ingolstadt', 'st-muc-hbf'],
    startStationId: 'st-ingolstadt',
    endStationId: 'st-muc-hbf',
    geometry: [
      [11.428, 48.766], [11.435, 48.700], [11.450, 48.630],
      [11.460, 48.550], [11.470, 48.460], [11.480, 48.380],
      [11.495, 48.300], [11.510, 48.230], [11.530, 48.180],
      [11.558, 48.140],
    ],
  },
  // ── NRW ──
  {
    id: 'rl-nrw-re1',
    name: 'RE1',
    fullName: 'RE1 Aachen – Hamm',
    bundesland: 'Nordrhein-Westfalen',
    color: '#E30613',
    stationIds: ['st-aachen', 'st-koeln', 'st-duesseldorf', 'st-duisburg', 'st-oberhausen', 'st-bochum', 'st-dortmund', 'st-hamm'],
    startStationId: 'st-aachen',
    endStationId: 'st-hamm',
    geometry: [
      [6.092, 50.768], [6.200, 50.812], [6.350, 50.845],
      [6.550, 50.895], [6.750, 50.925], [6.958, 50.943],
      [7.010, 51.010], [6.940, 51.080], [6.860, 51.130],
      [6.793, 51.220], [6.780, 51.330], [6.774, 51.430],
      [6.820, 51.460], [6.849, 51.472], [6.970, 51.472],
      [7.110, 51.472], [7.225, 51.478], [7.340, 51.492],
      [7.459, 51.519], [7.600, 51.570], [7.720, 51.630],
      [7.819, 51.679],
    ],
  },
  {
    id: 'rl-nrw-re5',
    name: 'RE5',
    fullName: 'RE5 Köln – Emmerich',
    bundesland: 'Nordrhein-Westfalen',
    color: '#009640',
    stationIds: ['st-koeln', 'st-leverkusen', 'st-duisburg', 'st-oberhausen', 'st-emmerich'],
    startStationId: 'st-koeln',
    endStationId: 'st-emmerich',
    geometry: [
      [6.958, 50.943], [6.975, 50.985], [6.987, 51.035],
      [6.990, 51.080], [6.920, 51.140], [6.840, 51.185],
      [6.793, 51.220], [6.780, 51.290], [6.774, 51.360],
      [6.774, 51.430], [6.815, 51.455], [6.849, 51.472],
      [6.750, 51.540], [6.660, 51.610], [6.550, 51.690],
      [6.420, 51.760], [6.300, 51.805], [6.243, 51.837],
    ],
  },
  {
    id: 'rl-nrw-re11',
    name: 'RE11',
    fullName: 'RE11 Düsseldorf – Ahlen',
    bundesland: 'Nordrhein-Westfalen',
    color: '#E95B0C',
    stationIds: ['st-duesseldorf', 'st-duisburg', 'st-bochum', 'st-dortmund', 'st-hamm', 'st-ahlen'],
    startStationId: 'st-duesseldorf',
    endStationId: 'st-ahlen',
    geometry: [
      [6.793, 51.220], [6.780, 51.310], [6.774, 51.390],
      [6.774, 51.430], [6.900, 51.455], [7.030, 51.468],
      [7.140, 51.472], [7.225, 51.478], [7.330, 51.490],
      [7.459, 51.519], [7.580, 51.570], [7.700, 51.620],
      [7.819, 51.679], [7.850, 51.720], [7.892, 51.764],
    ],
  },
  // ── Berlin / Brandenburg ──
  {
    id: 'rl-ber-re1',
    name: 'RE1',
    fullName: 'RE1 Frankfurt (Oder) – Berlin – Magdeburg',
    bundesland: 'Berlin',
    color: '#E30613',
    stationIds: ['st-ffo', 'st-berlin-ostbhf', 'st-berlin-hbf', 'st-berlin-spandau', 'st-potsdam', 'st-magdeburg'],
    startStationId: 'st-ffo',
    endStationId: 'st-magdeburg',
    geometry: [
      [14.550, 52.342], [14.350, 52.360], [14.100, 52.375],
      [13.870, 52.400], [13.650, 52.440], [13.434, 52.510],
      [13.370, 52.525], [13.280, 52.535], [13.197, 52.535],
      [13.120, 52.510], [13.068, 52.391], [12.900, 52.350],
      [12.680, 52.280], [12.450, 52.230], [12.180, 52.200],
      [11.900, 52.175], [11.700, 52.155], [11.627, 52.131],
    ],
  },
  {
    id: 'rl-ber-re5',
    name: 'RE5',
    fullName: 'RE5 Stralsund – Rostock – Berlin',
    bundesland: 'Berlin',
    color: '#009640',
    stationIds: ['st-stralsund', 'st-rostock', 'st-berlin-hbf'],
    startStationId: 'st-stralsund',
    endStationId: 'st-berlin-hbf',
    geometry: [
      [13.078, 54.317], [13.050, 54.220], [13.020, 54.130],
      [12.900, 54.100], [12.600, 54.082], [12.147, 54.079],
      [12.100, 53.920], [12.050, 53.750], [12.080, 53.580],
      [12.150, 53.420], [12.350, 53.270], [12.600, 53.130],
      [12.900, 52.980], [13.120, 52.820], [13.250, 52.690],
      [13.340, 52.580], [13.369, 52.525],
    ],
  },
  // ── Hamburg / SH ──
  {
    id: 'rl-hh-re7',
    name: 'RE7',
    fullName: 'RE7 Hamburg – Kiel – Flensburg',
    bundesland: 'Hamburg',
    color: '#0066B3',
    stationIds: ['st-hamburg-hbf', 'st-hamburg-altona', 'st-kiel', 'st-flensburg'],
    startStationId: 'st-hamburg-hbf',
    endStationId: 'st-flensburg',
    geometry: [
      [10.006, 53.553], [9.965, 53.552], [9.935, 53.550],
      [9.860, 53.590], [9.800, 53.660], [9.770, 53.760],
      [9.790, 53.870], [9.870, 53.980], [9.970, 54.100],
      [10.060, 54.200], [10.132, 54.315], [10.000, 54.420],
      [9.860, 54.510], [9.720, 54.590], [9.570, 54.660],
      [9.480, 54.720], [9.437, 54.774],
    ],
  },
  {
    id: 'rl-hh-re8',
    name: 'RE8',
    fullName: 'RE8 Hamburg – Kiel',
    bundesland: 'Hamburg',
    color: '#F5A200',
    stationIds: ['st-hamburg-hbf', 'st-hamburg-altona', 'st-kiel'],
    startStationId: 'st-hamburg-hbf',
    endStationId: 'st-kiel',
    geometry: [
      [10.006, 53.553], [9.965, 53.552], [9.935, 53.550],
      [9.880, 53.620], [9.850, 53.720], [9.870, 53.840],
      [9.920, 53.960], [9.990, 54.080], [10.060, 54.190],
      [10.132, 54.315],
    ],
  },
];

// Helper: get stations for a bundesland
export function getStationsForBundesland(bundesland: string): Station[] {
  if (bundesland === 'Berlin') {
    return stations.filter(
      (s) => s.bundesland === 'Berlin' || s.bundesland === 'Brandenburg' || s.bundesland === 'Sachsen-Anhalt'
    );
  }
  return stations.filter((s) => s.bundesland === bundesland);
}

// Helper: get rail lines for a bundesland
export function getRailLinesForBundesland(bundesland: string): RailLine[] {
  return railLines.filter((l) => l.bundesland === bundesland);
}

// Helper: get line geometry — uses explicit geometry field
export function getLineGeometry(line: RailLine): [number, number][] {
  return line.geometry;
}
