import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Match } from '../../../services/matchService';

const LEAGUE_SHORT: Record<string, string> = {
  bl1: '1. BL',
  bl2: '2. BL',
  bl3: '3. Liga',
  dfb: 'DFB-Pokal',
};

export function MatchNavigator({
  match,
  index,
  total,
  distanceKm,
  onPrev,
  onNext,
}: {
  match: Match;
  index: number;
  total: number;
  distanceKm?: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const dt = new Date(match.matchDateTime);
  const isUpcoming = !match.matchIsFinished;
  const final = match.matchResults.find((r) => r.resultOrderID === 2);

  const timeLabel = isUpcoming
    ? formatDistanceToNow(dt, { locale: de, addSuffix: true })
    : format(dt, 'EEE d. MMM', { locale: de });

  return (
    <div className="absolute bottom-3 left-3 right-3 z-30">
      <div className="bg-surface/95 backdrop-blur-md rounded-2xl shadow-2xl border border-divider overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <p className="text-foreground text-xs font-bold tracking-wide uppercase">
            {isUpcoming ? '⚽ Nächster Ground' : '⚽ Letztes Spiel'}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
              {LEAGUE_SHORT[match.leagueShortcut] ?? match.leagueShortcut}
            </span>
          </div>
        </div>

        {/* Match row */}
        <div className="flex items-center px-2 py-2">
          {/* Prev button */}
          <button
            onClick={onPrev}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:bg-surface-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-tertiary" />
          </button>

          {/* Teams */}
          <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
              <p className="text-foreground text-sm font-semibold truncate text-right">
                {match.team1.shortName || match.team1.teamName}
              </p>
              {match.team1.teamIconUrl && (
                <img src={match.team1.teamIconUrl} alt="" className="w-7 h-7 object-contain shrink-0" />
              )}
            </div>

            <div className="text-center shrink-0 w-14">
              {match.matchIsFinished && final ? (
                <p className="text-foreground text-lg font-bold leading-none">
                  {final.pointsTeam1}:{final.pointsTeam2}
                </p>
              ) : (
                <p className="text-foreground text-sm font-bold leading-none">
                  {format(dt, 'HH:mm')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0">
              {match.team2.teamIconUrl && (
                <img src={match.team2.teamIconUrl} alt="" className="w-7 h-7 object-contain shrink-0" />
              )}
              <p className="text-foreground text-sm font-semibold truncate">
                {match.team2.shortName || match.team2.teamName}
              </p>
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={onNext}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:bg-surface-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 flex items-center justify-between text-text-tertiary text-xs">
          <div className="flex items-center gap-3">
            <span>{timeLabel}</span>
            {distanceKm != null && (
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {distanceKm < 1 ? '<1' : Math.round(distanceKm)} km
              </span>
            )}
          </div>
          <span>{index + 1} / {total}</span>
        </div>
      </div>
    </div>
  );
}
