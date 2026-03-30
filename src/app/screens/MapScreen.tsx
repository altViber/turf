import { useState, useEffect } from 'react';
import { Train, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { MapView } from '../components/map/MapView';
import { GroundBottomSheet } from '../components/map/GroundBottomSheet';
import { RailModePanel } from '../components/map/RailModePanel';
import { LogVisitModal } from '../components/map/LogVisitModal';
import type { Ground, RailLine } from '../../types';

export function MapScreen() {
  const [selectedGround, setSelectedGround] = useState<Ground | null>(null);
  const [logVisitGround, setLogVisitGround] = useState<Ground | null>(null);
  const [logVisitOpen, setLogVisitOpen] = useState(false);
  const [railModeActive, setRailModeActive] = useState(false);
  const [railPanelOpen, setRailPanelOpen] = useState(false);
  const [selectedLines, setSelectedLines] = useState<RailLine[]>([]);
  const [reachableCount, setReachableCount] = useState(0);
  const [mapStatus, setMapStatus] = useState<'idle' | 'loading' | 'zoom-too-low'>('zoom-too-low');

  // Auto-dismiss the zoom-in hint after 6 s (user already sees clusters)
  const [hintDismissed, setHintDismissed] = useState(false);
  useEffect(() => {
    if (mapStatus !== 'zoom-too-low') {
      setHintDismissed(false); // reset if user zooms back out
      return;
    }
    const t = setTimeout(() => setHintDismissed(true), 6000);
    return () => clearTimeout(t);
  }, [mapStatus]);

  // Post-onboarding: show a welcome toast once the map loads
  useEffect(() => {
    const flag = sessionStorage.getItem('fromOnboarding');
    if (flag !== 'true') return;
    sessionStorage.removeItem('fromOnboarding');

    // Delay slightly so the map has time to render and seed data is applied
    const timer = setTimeout(() => {
      toast.success('Karte geladen', {
        description: 'Zoome rein, um Grounds zu entdecken.',
        duration: 4500,
        icon: '⚽',
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
        onGroundSelect={setSelectedGround}
        onVisibleCountChange={setReachableCount}
        onStatusChange={setMapStatus}
      />

      {/* Top-left: Rail Mode toggle */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <button
          onClick={toggleRailMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl shadow-lg transition-all font-medium text-sm ${
            railModeActive
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
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
          className="absolute bottom-20 right-4 z-20 bg-blue-600 text-white px-3 py-2 rounded-2xl shadow-lg text-xs font-medium flex items-center gap-1.5"
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
          <div className="bg-white rounded-2xl px-3 py-1.5 shadow border border-gray-100 text-xs text-gray-600 font-medium">
            {reachableCount} reachable ground{reachableCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Bottom status hints ────────────────────────────────────────────── */}

      {/* Zoom-in hint: clusters are already visible — shown for first 6 s then auto-dismissed */}
      {!railModeActive && mapStatus === 'zoom-too-low' && !hintDismissed && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/60 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm shadow-lg whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 text-green-300 shrink-0" />
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