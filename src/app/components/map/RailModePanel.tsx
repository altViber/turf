import { useState } from 'react';
import { Train, ChevronRight, Check, X, MapPin } from 'lucide-react';
import { railLines, getRailLinesForBundesland } from '../../../data/railData';
import type { RailLine } from '../../../types';

// Bundesländer that have rail data
const RAIL_BUNDESLAENDER = [...new Set(railLines.map((l) => l.bundesland))].sort();

interface RailModePanelProps {
  selectedLines: RailLine[];
  onLinesChange: (lines: RailLine[]) => void;
  onClose: () => void;
}

export function RailModePanel({ selectedLines, onLinesChange, onClose }: RailModePanelProps) {
  const [selectedBundesland, setSelectedBundesland] = useState<string | null>(
    selectedLines[0]?.bundesland ?? null
  );

  const availableLines = selectedBundesland
    ? getRailLinesForBundesland(selectedBundesland)
    : [];

  const toggleLine = (line: RailLine) => {
    const exists = selectedLines.some((l) => l.id === line.id);
    if (exists) {
      onLinesChange(selectedLines.filter((l) => l.id !== line.id));
    } else {
      onLinesChange([...selectedLines, line]);
    }
  };

  const clearAll = () => {
    onLinesChange([]);
    setSelectedBundesland(null);
  };

  return (
    <div className="absolute bottom-20 left-0 right-0 mx-3 bg-surface-elevated rounded-3xl shadow-2xl border border-divider overflow-hidden z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-info rounded-lg flex items-center justify-center">
            <Train className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-foreground font-semibold text-sm">Rail Mode</p>
            <p className="text-text-tertiary text-xs">30-min reachability from RE stations</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {selectedLines.length > 0 && (
            <button
              onClick={clearAll}
              className="text-text-tertiary text-xs px-2 py-1 rounded-lg hover:bg-surface-muted"
            >
              Clear
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Active line badges */}
      {selectedLines.length > 0 && (
        <div className="px-4 py-2.5 flex gap-2 flex-wrap border-b border-divider">
          {selectedLines.map((line) => (
            <button
              key={line.id}
              onClick={() => toggleLine(line)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: line.color }}
            >
              {line.name}
              <X className="w-3 h-3" />
            </button>
          ))}
          <span className="text-text-tertiary text-xs self-center">
            {selectedLines.length} line{selectedLines.length !== 1 ? 's' : ''} · 30 min radius
          </span>
        </div>
      )}

      <div className="flex" style={{ maxHeight: '220px' }}>
        {/* Bundesland list */}
        <div className="w-2/5 border-r border-divider overflow-y-auto">
          {RAIL_BUNDESLAENDER.map((bl) => (
            <button
              key={bl}
              onClick={() => setSelectedBundesland(bl)}
              className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors ${
                selectedBundesland === bl
                  ? 'bg-accent-primary/10 text-foreground'
                  : 'text-text-secondary hover:bg-background'
              }`}
            >
              <span className="text-xs font-medium truncate">{bl}</span>
              {selectedBundesland === bl && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-accent-primary" />}
            </button>
          ))}
        </div>

        {/* Lines list */}
        <div className="flex-1 overflow-y-auto">
          {!selectedBundesland ? (
            <div className="flex flex-col items-center justify-center h-full py-6 text-text-tertiary">
              <MapPin className="w-5 h-5 mb-1" />
              <p className="text-xs">Select a Bundesland</p>
            </div>
          ) : availableLines.length === 0 ? (
            <div className="flex items-center justify-center h-full py-6 text-text-tertiary text-xs">
              No RE lines available
            </div>
          ) : (
            availableLines.map((line) => {
              const isSelected = selectedLines.some((l) => l.id === line.id);
              return (
                <button
                  key={line.id}
                  onClick={() => toggleLine(line)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                    isSelected ? 'bg-background' : 'hover:bg-background'
                  }`}
                >
                  {/* Line badge */}
                  <div
                    className="flex-shrink-0 px-2 py-0.5 rounded-md text-white text-xs font-bold min-w-[36px] text-center"
                    style={{ backgroundColor: line.color }}
                  >
                    {line.name}
                  </div>
                  <span className="text-xs text-text-secondary flex-1 text-left truncate">{line.fullName}</span>
                  {isSelected && <Check className="w-4 h-4 text-accent-primary flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-divider bg-accent-primary/10">
        <p className="text-accent-primary text-xs text-center">
          Only grounds within <strong>30 minutes</strong> of selected RE stations are shown
        </p>
      </div>
    </div>
  );
}
