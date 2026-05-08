import { X, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import type { Match } from '../../../services/matchService';

const LEAGUE_SHORT: Record<string, string> = {
  bl1: '1. BL',
  bl2: '2. BL',
  bl3: '3. Liga',
  dfb: 'DFB-Pokal',
};

export function MatchBottomSheet({
  match,
  onClose,
}: {
  match: Match | null;
  onClose: () => void;
}) {
  if (!match) return null;

  const dt = new Date(match.matchDateTime);
  const final = match.matchResults.find((r) => r.resultOrderID === 2);
  const halftime = match.matchResults.find((r) => r.resultOrderID === 1);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      <div className="bg-surface rounded-t-3xl shadow-2xl border-t border-divider px-5 pt-4 pb-6 safe-area-bottom">
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
            {LEAGUE_SHORT[match.leagueShortcut] ?? match.leagueShortcut}
          </span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-surface-muted flex items-center justify-center">
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex-1 text-center">
            {match.team1.teamIconUrl && (
              <img src={match.team1.teamIconUrl} alt="" className="w-10 h-10 mx-auto mb-1 object-contain" />
            )}
            <p className="text-foreground text-sm font-semibold leading-tight">
              {match.team1.shortName || match.team1.teamName}
            </p>
          </div>

          <div className="text-center px-3">
            {match.matchIsFinished && final ? (
              <p className="text-foreground text-2xl font-bold">
                {final.pointsTeam1} : {final.pointsTeam2}
              </p>
            ) : (
              <p className="text-text-tertiary text-lg font-semibold">vs</p>
            )}
            {halftime && match.matchIsFinished && (
              <p className="text-text-tertiary text-xs">
                ({halftime.pointsTeam1}:{halftime.pointsTeam2})
              </p>
            )}
          </div>

          <div className="flex-1 text-center">
            {match.team2.teamIconUrl && (
              <img src={match.team2.teamIconUrl} alt="" className="w-10 h-10 mx-auto mb-1 object-contain" />
            )}
            <p className="text-foreground text-sm font-semibold leading-tight">
              {match.team2.shortName || match.team2.teamName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-text-tertiary text-xs">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {format(dt, 'EEE d. MMM, HH:mm', { locale: de })} Uhr
          </span>
          {match.ground && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {match.ground.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
