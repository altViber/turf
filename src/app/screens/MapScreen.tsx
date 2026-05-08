import { useState, useEffect, useMemo, useCallback } from 'react';
import { Train, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { MapView, type FlyToTarget } from '../components/map/MapView';
import { GroundBottomSheet } from '../components/map/GroundBottomSheet';
import { MatchNavigator } from '../components/map/MatchNavigator';
import { RailModePanel } from '../components/map/RailModePanel';
import { LogVisitModal } from '../components/map/LogVisitModal';
import { getUpcomingMatches, type Match } from '../../services/matchService';
import { haversineKm } from '../../services/groundService';
import type { Ground, RailLine } from '../../types';

export function MapScreen() {
  const [selectedGround, setSelectedGround] = useState<Ground | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [logVisitGround, setLogVisitGround] = useState<Ground | null>(null);
  const [logVisitOpen, setLogVisitOpen] = useState(false);
  const [railModeActive, setRailModeActive] = useState(false);
  const [railPanelOpen, setRailPanelOpen] = useState(false);
  const [selectedLines, setSelectedLines] = useState<RailLine[]>([]);
  const [reachableCount, setReachableCount] = useState(0);
  const [mapStatus, setMapStatus] = useState<'idle' | 'loading' | 'zoom-too-low'>('zoom-too-low');
  const [matches, setMatches] = useState<Match[]>([]);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [matchIndex, setMatchIndex] = useState(0);
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);
  const [initialFlyDone, setInitialFlyDone] = useState(false);

  // Sorted matches: upcoming first, sorted by distance from user
  const sortedMatches = useMemo(() => {
    const upcoming = matches.filter((m) => !m.matchIsFinished && m.ground);
    if (!userLoc) return upcoming;
    return upcoming.sort((a, b) => {
      const distA = haversineKm(userLoc.lat, userLoc.lng, a.ground!.lat, a.ground!.lng);
      const distB = haversineKm(userLoc.lat, userLoc.lng, b.ground!.lat, b.ground!.lng);
      return distA - distB;
    });
  }, [matches, userLoc]);

  // Get user location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  // Fetch upcoming matches from OpenLigaDB
  useEffect(() => {
    getUpcomingMatches().then(setMatches).catch(() => {});
  }, []);

  // Auto-fly to nearest match on first load
  useEffect(() => {
    if (initialFlyDone || sortedMatches.length === 0) return;
    const m = sortedMatches[0];
    if (!m.ground) return;
    setInitialFlyDone(true);
    setMatchIndex(0);
    setSelectedMatch(m);
    setTimeout(() => {
      setFlyTo({ lng: m.ground!.lng, lat: m.ground!.lat, zoom: 13 });
    }, 500);
  }, [sortedMatches, initialFlyDone]);

  const navigateMatch = useCallback((dir: 1 | -1) => {
    if (sortedMatches.length === 0) return;
    const next = (matchIndex + dir + sortedMatches.length) % sortedMatches.length;
    setMatchIndex(next);
    const m = sortedMatches[next];
    setSelectedGround(null);
    setSelectedMatch(m);
    if (m.ground) {
      setFlyTo({ lng: m.ground.lng, lat: m.ground.lat, zoom: 13 });
    }
  }, [sortedMatches, matchIndex]);

  // Auto-dismiss the zoom-in hint after 6 s
  const [hintDismissed, setHintDismissed] = useState(false);
  useEffect(() => {
    if (mapStatus !== 'zoom-too-low') {
      setHintDismissed(false);
      return;
    }
    const t = setTimeout(() => setHintDismissed(true), 6000);
    return () => clearTimeout(t);
  }, [mapStatus]);

  // Post-onboarding welcome toast
  useEffect(() => {
    const flag = sessionStorage.getItem('fromOnboarding');
    if (flag !== 'true') return;
    sessionStorage.removeItem('fromOnboarding');
    const timer = setTimeout(() => {
      toast.success('Karte geladen', {
        description: 'Zoome rein, um Grounds zu entdecken.',
        duration: 4500,
        icon: undefined,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleRailMode = () => {
    if (railModeActive) {
      setRailModeActive(false);
      setRailPanelOpen(false);
      setSelectedLines([]);
    } else {
      setRailModeActive(true);
      setRailPanelOpen(true);
    }
  };

  const handleLogVisit = () => {
    setLogVisitGround(selectedGround);
    setLogVisitOpen(true);
  };

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapView
        railModeActive={railModeActive}
        selectedLines={selectedLines}
        matches={matches}
        flyTo={flyTo}
        onGroundSelect={(g) => { setSelectedMatch(null); setSelectedGround(g); }}
        onMatchSelect={(m) => { setSelectedGround(null); setSelectedMatch(m); }}
        onVisibleCountChange={setReachableCount}
        onStatusChange={setMapStatus}
      />

      {/* Top-left: Rail Mode toggle */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={toggleRailMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg transition-all font-medium text-sm ${
            railModeActive
              ? 'bg-info text-white'
              : 'bg-surface text-text-secondary border border-border'
          }`}
        >
          <Train className="w-4 h-4" />
          Rail Mode
          {railModeActive && selectedLines.length > 0 && (
            <span className="bg-white/30 text-white rounded-full px-1.5 py-0.5 text-xs font-bold">
              {selectedLines.length}
            </span>
          )}
        </button>

        {/* Active line badges */}
        {railModeActive && selectedLines.length > 0 && (
          <div className="flex flex-col gap-1">
            {selectedLines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow text-white text-xs font-bold"
                style={{ backgroundColor: line.color }}
              >
                <Train className="w-3 h-3" />
                {line.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rail mode panel toggle button (when closed) */}
      {railModeActive && !railPanelOpen && (
        <button
          onClick={() => setRailPanelOpen(true)}
          className="absolute bottom-20 right-4 z-20 bg-info text-white px-3 py-2 rounded-2xl shadow-lg text-xs font-medium flex items-center gap-1.5"
        >
          <Train className="w-3.5 h-3.5" />
          Configure lines
        </button>
      )}

      {/* Rail Mode Panel */}
      {railModeActive && railPanelOpen && (
        <RailModePanel
          selectedLines={selectedLines}
          onLinesChange={setSelectedLines}
          onClose={() => setRailPanelOpen(false)}
        />
      )}

      {/* Ground count overlay */}
      {railModeActive && selectedLines.length > 0 && (
        <div className="absolute top-4 right-16 z-20">
          <div className="bg-surface rounded-2xl px-3 py-1.5 shadow border border-divider text-xs text-text-secondary font-medium">
            {reachableCount} reachable ground{reachableCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Bottom status hints ────────────────────────────────────────────── */}

      {/* Zoom-in hint: clusters are already visible — shown for first 6 s then auto-dismissed */}
      {!railModeActive && mapStatus === 'zoom-too-low' && !hintDismissed && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm shadow-lg whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-accent-primary/50 shrink-0" />
            <span>
              Clusters visible &mdash; zoom in to see individual grounds
            </span>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!railModeActive && mapStatus === 'loading' && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Loading grounds from OpenStreetMap…
          </div>
        </div>
      )}

      {/* Match Navigator */}
      {sortedMatches.length > 0 && sortedMatches[matchIndex] && !selectedGround && (
        <MatchNavigator
          match={sortedMatches[matchIndex]}
          index={matchIndex}
          total={sortedMatches.length}
          distanceKm={userLoc && sortedMatches[matchIndex].ground
            ? haversineKm(userLoc.lat, userLoc.lng, sortedMatches[matchIndex].ground!.lat, sortedMatches[matchIndex].ground!.lng)
            : undefined}
          userLoc={userLoc}
          onPrev={() => navigateMatch(-1)}
          onNext={() => navigateMatch(1)}
        />
      )}

      {/* Ground Bottom Sheet */}
      <GroundBottomSheet
        ground={selectedGround}
        onClose={() => setSelectedGround(null)}
        onLogVisit={handleLogVisit}
      />

      {/* Log Visit Modal */}
      <LogVisitModal
        ground={logVisitGround}
        open={logVisitOpen}
        onClose={() => { setLogVisitOpen(false); setLogVisitGround(null); }}
      />
    </div>
  );
}