import { ChevronLeft, ChevronRight, MapPin, Navigation, BookmarkPlus, BookmarkCheck, Share2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { useApp } from '../../../context/AppContext';
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
  userLoc,
  onPrev,
  onNext,
}: {
  match: Match;
  index: number;
  total: number;
  distanceKm?: number;
  userLoc?: { lat: number; lng: number } | null;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { isBookmarked, addBookmark, removeBookmark } = useApp();
  const dt = new Date(match.matchDateTime);
  const isUpcoming = !match.matchIsFinished;
  const final = match.matchResults.find((r) => r.resultOrderID === 2);
  const ground = match.ground;
  const bookmarked = ground ? isBookmarked(ground.id) : false;

  const timeLabel = isUpcoming
    ? formatDistanceToNow(dt, { locale: de, addSuffix: true })
    : format(dt, 'EEE d. MMM', { locale: de });

  const handleRoute = () => {
    if (!ground) return;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const dest = `${ground.lat},${ground.lng}`;
    if (isIOS) {
      const origin = userLoc ? `&saddr=${userLoc.lat},${userLoc.lng}` : '';
      window.open(`https://maps.apple.com/?daddr=${dest}&dirflg=d${origin}`, '_blank');
    } else {
      const origin = userLoc ? `&origin=${userLoc.lat},${userLoc.lng}` : '';
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}${origin}`, '_blank');
    }
  };

  const handlePlan = () => {
    if (!ground) return;
    if (bookmarked) {
      removeBookmark(ground.id);
      toast('Bookmark entfernt');
    } else {
      addBookmark(ground.id, ground);
      toast.success('Ground gemerkt', { description: ground.name });
    }
  };

  const handleShare = async () => {
    if (!ground) return;
    const team1 = match.team1.shortName || match.team1.teamName;
    const team2 = match.team2.shortName || match.team2.teamName;
    const league = LEAGUE_SHORT[match.leagueShortcut] ?? match.leagueShortcut;
    const dateStr = format(dt, "EEE d. MMM, HH:mm 'Uhr'", { locale: de });
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${ground.lat},${ground.lng}`;

    const text = [
      `${team1} vs ${team2}`,
      `${league} · ${dateStr}`,
      `${ground.name}, ${ground.city}`,
      mapsUrl,
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: `${team1} vs ${team2}`, text });
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          await copyToClipboard(text);
        }
      }
    } else {
      await copyToClipboard(text);
    }
  };

  return (
    <div className="absolute bottom-3 left-3 right-3 z-30">
      <div className="bg-surface/95 backdrop-blur-md rounded-2xl shadow-2xl border border-divider overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <p className="text-foreground text-xs font-bold tracking-wide uppercase">
            {isUpcoming ? 'Nächster Ground' : 'Letztes Spiel'}
          </p>
          <span className="text-xs font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full">
            {LEAGUE_SHORT[match.leagueShortcut] ?? match.leagueShortcut}
          </span>
        </div>

        {/* Match row */}
        <div className="flex items-center px-2 py-2">
          <button
            onClick={onPrev}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:bg-surface-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-text-tertiary" />
          </button>

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

          <button
            onClick={onNext}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:bg-surface-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-tertiary" />
          </button>
        </div>

        {/* Action buttons */}
        {ground && (
          <div className="flex items-center justify-center gap-2 px-4 py-1.5">
            <button
              onClick={handleRoute}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-info/10 text-info text-xs font-medium active:scale-95 transition-transform"
            >
              <Navigation className="w-3.5 h-3.5" />
              Route
            </button>
            <button
              onClick={handlePlan}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium active:scale-95 transition-transform ${
                bookmarked ? 'bg-accent-primary/10 text-accent-primary' : 'bg-surface-muted text-text-secondary'
              }`}
            >
              {bookmarked
                ? <BookmarkCheck className="w-3.5 h-3.5" />
                : <BookmarkPlus className="w-3.5 h-3.5" />}
              {bookmarked ? 'Gemerkt' : 'Merken'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-muted text-text-secondary text-xs font-medium active:scale-95 transition-transform"
            >
              <Share2 className="w-3.5 h-3.5" />
              Teilen
            </button>
          </div>
        )}

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

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('In Zwischenablage kopiert');
  } catch {
    toast.error('Teilen fehlgeschlagen');
  }
}
