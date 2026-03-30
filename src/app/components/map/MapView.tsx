import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Ground, RailLine } from '../../../types';
import { stations, getLineGeometry } from '../../../data/railData';
import { fetchGrounds, haversineKm, MAX_REACH_KM } from '../../../services/groundService';
import { grounds as seedGrounds } from '../../../data/grounds';

interface MapViewProps {
  railModeActive: boolean;
  selectedLines: RailLine[];
  onGroundSelect: (ground: Ground) => void;
  onVisibleCountChange?: (count: number) => void;
  onStatusChange?: (status: 'idle' | 'loading' | 'zoom-too-low') => void;
}

const OSM_STYLE = {
  version: 8 as const,
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm', minzoom: 0, maxzoom: 19 }],
};

/** Minimum zoom before we fire Overpass queries (avoid fetching huge areas) */
const MIN_FETCH_ZOOM = 11;

/** Below this zoom, hide individual ground markers in Rail Mode */
const RAIL_GROUND_SHOW_ZOOM = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Serialize a Ground into GeoJSON feature properties (all values must be flat) */
function groundToFeatureProps(g: Ground): Record<string, unknown> {
  return {
    id: g.id,
    name: g.name,
    city: g.city,
    isStadium: g.isStadium,
    capacity: g.capacity ?? 0,
    // Full serialized data for click recovery
    _groundJson: JSON.stringify(g),
  };
}

function groundsToGeoJSON(gs: Ground[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: gs.map((g) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [g.lng, g.lat] },
      properties: groundToFeatureProps(g),
    })),
  };
}

function railLinesToGeoJSON(lines: RailLine[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: lines.map((line) => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: getLineGeometry(line) },
      properties: { lineId: line.id, name: line.name, color: line.color },
    })),
  };
}

function selectedStationsGeoJSON(lines: RailLine[]): GeoJSON.FeatureCollection {
  const stationIds = new Set(lines.flatMap((l) => l.stationIds));
  const stationsOnLines = stations.filter((s) => stationIds.has(s.id));
  return {
    type: 'FeatureCollection',
    features: stationsOnLines.map((s) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name },
    })),
  };
}

/**
 * 30-minute rule: ground is reachable if within MAX_REACH_KM of any station
 * on the selected lines.
 */
function isRailReachable(ground: Ground, lines: RailLine[]): boolean {
  if (lines.length === 0) return false;
  const stationIds = new Set(lines.flatMap((l) => l.stationIds));
  return stations
    .filter((s) => stationIds.has(s.id))
    .some((s) => haversineKm(s.lat, s.lng, ground.lat, ground.lng) <= MAX_REACH_KM);
}

/** Create a styled terminal marker element ("Start" / "End") */
function createTerminalEl(lineName: string, label: string, color: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'display:flex;flex-direction:column;align-items:center;cursor:default;pointer-events:none;';

  const pill = document.createElement('div');
  pill.style.cssText = [
    `background:${color}`,
    'color:#fff',
    'border:2px solid #fff',
    'border-radius:20px',
    'padding:3px 9px',
    'font-size:11px',
    'font-weight:700',
    'white-space:nowrap',
    'box-shadow:0 2px 8px rgba(0,0,0,0.35)',
    'line-height:1.4',
  ].join(';');
  pill.textContent = `${lineName} · ${label}`;

  const dot = document.createElement('div');
  dot.style.cssText = [
    'width:8px',
    'height:8px',
    'border-radius:50%',
    `background:${color}`,
    'border:2px solid #fff',
    'margin-top:3px',
    'box-shadow:0 1px 4px rgba(0,0,0,0.3)',
  ].join(';');

  wrap.appendChild(pill);
  wrap.appendChild(dot);
  return wrap;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MapView({
  railModeActive,
  selectedLines,
  onGroundSelect,
  onVisibleCountChange,
  onStatusChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Stable refs for callbacks / props so effects don't recreate the map
  const onGroundSelectRef = useRef(onGroundSelect);
  onGroundSelectRef.current = onGroundSelect;
  const onVisibleCountChangeRef = useRef(onVisibleCountChange);
  onVisibleCountChangeRef.current = onVisibleCountChange;
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const railModeActiveRef = useRef(railModeActive);
  railModeActiveRef.current = railModeActive;
  const selectedLinesRef = useRef(selectedLines);
  selectedLinesRef.current = selectedLines;

  /**
   * All grounds accumulated across sessions (seed + OSM fetched).
   * Keyed by Ground.id to deduplicate. Initialized immediately with seed data
   * so the map is never empty on first load.
   */
  const allGroundsRef = useRef<Map<string, Ground>>(
    new Map(seedGrounds.map((g) => [g.id, g]))
  );

  // Terminal markers for rail line start/end
  const terminalMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Debounce timer for Overpass fetch
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── ResizeObserver ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Apply rail filter & update BOTH sources ────────────────────────────────
  const applyGroundsToSource = useCallback((
    map: maplibregl.Map,
    grounds: Ground[]
  ) => {
    const clusteredSrc = map.getSource('grounds') as maplibregl.GeoJSONSource | undefined;
    const heatSrc = map.getSource('grounds-heat') as maplibregl.GeoJSONSource | undefined;
    if (!clusteredSrc) return;

    let visible: Ground[];
    if (railModeActiveRef.current && selectedLinesRef.current.length > 0) {
      visible = grounds.filter((g) => isRailReachable(g, selectedLinesRef.current));
    } else {
      visible = grounds;
    }

    const geoJSON = groundsToGeoJSON(visible);
    clusteredSrc.setData(geoJSON);
    heatSrc?.setData(geoJSON);
    onVisibleCountChangeRef.current?.(visible.length);
  }, []);

  // ── Fetch grounds from Overpass (debounced) ────────────────────────────────
  const debouncedFetch = useCallback(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      const map = mapRef.current;
      if (!map || !map.isStyleLoaded()) return;

      const zoom = map.getZoom();
      if (zoom < MIN_FETCH_ZOOM) {
        // Too zoomed out to fetch from OSM — but KEEP existing grounds visible
        // (seed data fills the map with clusters at any zoom level).
        onStatusChangeRef.current?.('zoom-too-low');
        return;
      }

      onStatusChangeRef.current?.('loading');
      const bounds = map.getBounds();
      try {
        const fetched = await fetchGrounds(
          bounds.getSouth(),
          bounds.getWest(),
          bounds.getNorth(),
          bounds.getEast()
        );

        // Merge OSM results into the accumulated ground map (dedup by id)
        for (const g of fetched) {
          allGroundsRef.current.set(g.id, g);
        }

        const allGrounds = Array.from(allGroundsRef.current.values());
        if (map.isStyleLoaded()) applyGroundsToSource(map, allGrounds);
        onStatusChangeRef.current?.('idle');
      } catch (err) {
        console.error('Overpass fetch error:', err);
        onStatusChangeRef.current?.('idle');
      }
    }, 700);
  }, [applyGroundsToSource]);

  // ── Ground layer visibility (zoom + rail mode) ─────────────────────────────
  const updateGroundLayerVisibility = useCallback((map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;
    const zoom = map.getZoom();

    // Clusters are always visible (they show seed data at low zoom and OSM data when available)
    for (const layerId of ['clusters', 'cluster-count']) {
      if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', 'visible');
    }

    // Heatmap: show at low zoom, fade as user zooms in (handled by paint expression)
    if (map.getLayer('grounds-heatmap')) {
      map.setLayoutProperty('grounds-heatmap', 'visibility', 'visible');
    }

    // Individual markers: hide in rail mode below RAIL_GROUND_SHOW_ZOOM
    // (Above MIN_FETCH_ZOOM, the cluster system automatically expands clusters to individual points)
    const showIndividual =
      !railModeActiveRef.current || zoom >= RAIL_GROUND_SHOW_ZOOM;
    if (map.getLayer('unclustered-point')) {
      map.setLayoutProperty('unclustered-point', 'visibility', showIndividual ? 'visible' : 'none');
    }
  }, []);

  // ── Initialize map (runs once) ─────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [10.4515, 51.1657],
      zoom: 5.5,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      map.resize();

      // ── Ground density heatmap source (not clustered, always has data) ────
      map.addSource('grounds-heat', {
        type: 'geojson',
        data: groundsToGeoJSON([]),
      });

      // Heatmap layer — visible at low zoom, fades out above zoom 12
      map.addLayer({
        id: 'grounds-heatmap',
        type: 'heatmap',
        source: 'grounds-heat',
        maxzoom: 14,
        paint: {
          // Weight each point equally; could use capacity for weighted density
          'heatmap-weight': 1,
          // Intensity increases with zoom
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            0, 0.4,
            9, 1.2,
            11, 2,
          ],
          // Color ramp: transparent → light green → deep green
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0,   'rgba(0,0,0,0)',
            0.1, 'rgba(74,222,128,0.15)',
            0.3, 'rgba(34,197,94,0.45)',
            0.55,'rgba(22,163,74,0.65)',
            0.75,'rgba(21,128,61,0.78)',
            1,   'rgba(14,90,40,0.88)',
          ],
          // Radius grows as you zoom in so clusters stay meaningful
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            0, 18,
            6, 30,
            9, 45,
            11, 60,
          ],
          // Fade heatmap out as individual markers become visible
          'heatmap-opacity': [
            'interpolate', ['linear'], ['zoom'],
            8,  0.85,
            11, 0.5,
            13, 0,
          ],
        },
      });

      // ── Ground source (clustering for circles + individual markers) ────────
      map.addSource('grounds', {
        type: 'geojson',
        data: groundsToGeoJSON([]),
        cluster: true,
        clusterMaxZoom: 11,   // Above z11 expand to individual points
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'grounds',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step', ['get', 'point_count'],
            '#4ade80', 5,
            '#16a34a', 20,
            '#166534',
          ],
          'circle-radius': [
            'step', ['get', 'point_count'],
            18, 5,
            26, 20,
            34,
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.92,
        },
      });

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'grounds',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
        },
        paint: { 'text-color': '#fff' },
      });

      // Individual ground markers (only appear when cluster expands above z11)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'grounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['==', ['get', 'isStadium'], true], '#16a34a',
            '#4ade80',
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 6, 14, 10],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // ── Rail line source ──────────────────────────────────────────────────
      map.addSource('rail-lines', { type: 'geojson', data: railLinesToGeoJSON([]) });
      map.addLayer({
        id: 'rail-lines-layer',
        type: 'line',
        source: 'rail-lines',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 4, 10, 6, 14, 9],
          'line-opacity': 1,
        },
      });

      // Rail line name labels along the route
      map.addLayer({
        id: 'rail-line-labels',
        type: 'symbol',
        source: 'rail-lines',
        layout: {
          'symbol-placement': 'line',
          'text-field': '{name}',
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'text-offset': [0, -1.0],
          'text-rotation-alignment': 'map',
          'symbol-spacing': 250,
        },
        paint: {
          'text-color': ['get', 'color'],
          'text-halo-color': '#fff',
          'text-halo-width': 2,
        },
      });

      // ── Rail station source ───────────────────────────────────────────────
      map.addSource('rail-stations', { type: 'geojson', data: selectedStationsGeoJSON([]) });
      map.addLayer({
        id: 'rail-stations-layer',
        type: 'circle',
        source: 'rail-stations',
        paint: {
          'circle-color': '#1d4ed8',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 5, 12, 9],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Station name labels (visible above zoom 9)
      map.addLayer({
        id: 'rail-station-labels',
        type: 'symbol',
        source: 'rail-stations',
        minzoom: 9,
        layout: {
          'text-field': '{name}',
          'text-font': ['Open Sans Regular'],
          'text-size': 11,
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#1e3a8a',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5,
        },
      });

      // ── Seed data: populate both sources immediately so map is never empty ─
      const seedGeoJSON = groundsToGeoJSON(Array.from(allGroundsRef.current.values()));
      (map.getSource('grounds') as maplibregl.GeoJSONSource).setData(seedGeoJSON);
      (map.getSource('grounds-heat') as maplibregl.GeoJSONSource).setData(seedGeoJSON);
      onVisibleCountChangeRef.current?.(allGroundsRef.current.size);
      onStatusChangeRef.current?.('zoom-too-low'); // initial zoom is 5.5

      // ── Ground click handler ──────────────────────────────────────────────
      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        try {
          const ground = JSON.parse(
            feature.properties?._groundJson as string
          ) as Ground;
          onGroundSelectRef.current(ground);
        } catch {
          console.error('Failed to parse ground data from GeoJSON feature');
        }
      });

      // Cluster zoom-in on click
      map.on('click', 'clusters', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const src = map.getSource('grounds') as maplibregl.GeoJSONSource;
        const clusterId = feature.properties?.cluster_id as number;
        Promise.resolve(src.getClusterExpansionZoom(clusterId))
          .then((zoom: number) => {
            map.easeTo({
              center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
              zoom,
            });
          })
          .catch(() => {});
      });

      for (const layer of ['unclustered-point', 'clusters']) {
        map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
      }

      // ── Move / zoom events — debounced Overpass fetch ─────────────────────
      map.on('moveend', debouncedFetch);
      map.on('zoomend', () => {
        debouncedFetch();
        updateGroundLayerVisibility(map);
      });

      // Initial fetch: fires immediately (returns early at z5.5 but sets status correctly)
      debouncedFetch();
    });

    mapRef.current = map;
    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-apply rail filter when selected lines change ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const allGrounds = Array.from(allGroundsRef.current.values());
    const apply = () => applyGroundsToSource(map, allGrounds);
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [railModeActive, selectedLines, applyGroundsToSource]);

  // ── Ground layer visibility when railMode changes ──────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => updateGroundLayerVisibility(map);
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [railModeActive, updateGroundLayerVisibility]);

  // ── Update rail layers (lines + stations) ─────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const lineSrc = map.getSource('rail-lines') as maplibregl.GeoJSONSource | undefined;
      const stSrc = map.getSource('rail-stations') as maplibregl.GeoJSONSource | undefined;
      if (railModeActive && selectedLines.length > 0) {
        lineSrc?.setData(railLinesToGeoJSON(selectedLines));
        stSrc?.setData(selectedStationsGeoJSON(selectedLines));
      } else {
        lineSrc?.setData(railLinesToGeoJSON([]));
        stSrc?.setData(selectedStationsGeoJSON([]));
      }
    };
    if (map.isStyleLoaded()) update();
    else map.once('load', update);
  }, [railModeActive, selectedLines]);

  // ── Terminal markers: Start & End for each selected line ─────────────────
  useEffect(() => {
    const map = mapRef.current;
    terminalMarkersRef.current.forEach((m) => m.remove());
    terminalMarkersRef.current = [];

    if (!map || !railModeActive || selectedLines.length === 0) return;

    const addMarkers = () => {
      selectedLines.forEach((line) => {
        const geometry = getLineGeometry(line);
        if (geometry.length < 2) return;

        const [startLng, startLat] = geometry[0];
        const [endLng, endLat] = geometry[geometry.length - 1];

        const startMarker = new maplibregl.Marker({
          element: createTerminalEl(line.name, 'Start', line.color),
          anchor: 'bottom',
          offset: [0, -4],
        }).setLngLat([startLng, startLat]).addTo(map);

        const endMarker = new maplibregl.Marker({
          element: createTerminalEl(line.name, 'End', line.color),
          anchor: 'bottom',
          offset: [0, -4],
        }).setLngLat([endLng, endLat]).addTo(map);

        terminalMarkersRef.current.push(startMarker, endMarker);
      });
    };

    if (map.isStyleLoaded()) addMarkers();
    else map.once('load', addMarkers);

    return () => {
      terminalMarkersRef.current.forEach((m) => m.remove());
      terminalMarkersRef.current = [];
    };
  }, [railModeActive, selectedLines]);

  // ── Fit map to selected rail lines ────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !railModeActive || selectedLines.length === 0) return;
    const coords = selectedLines.flatMap((l) => getLineGeometry(l));
    if (coords.length === 0) return;
    const bounds = coords.reduce(
      (b, [lng, lat]) => b.extend([lng, lat]),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    const fit = () => map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 1000 });
    if (map.isStyleLoaded()) fit();
    else map.once('load', fit);
  }, [railModeActive, selectedLines]);

  return <div ref={containerRef} className="w-full h-full" />;
}
