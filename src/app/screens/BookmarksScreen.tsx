import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Bookmark, BookmarkX, Building2, Zap, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { grounds as staticGrounds } from '../../data/grounds';
import type { Ground } from '../../types';

/** Resolve ground from embedded data or static fallback */
function resolveGround(groundId: string, groundData?: Ground | null): Ground | undefined {
  return groundData ?? staticGrounds.find((g) => g.id === groundId);
}

export function BookmarksScreen() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark } = useApp();

  const bookmarkedGrounds = bookmarks
    .map((b) => ({ bookmark: b, ground: resolveGround(b.groundId, b.groundData) }))
    .filter((item) => item.ground != null) as {
      bookmark: typeof bookmarks[0];
      ground: Ground;
    }[];

  const openInMaps = (ground: Ground) => {
    const q = encodeURIComponent(`${ground.name}, ${ground.city}, Germany`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-divider px-4 pt-12 pb-4 sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-text-tertiary text-sm mb-3">
          <ArrowLeft className="w-4 h-4" />
          Profile
        </button>
        <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 700 }}>Bookmarks</h1>
        <p className="text-text-tertiary text-sm">
          {bookmarkedGrounds.length} ground{bookmarkedGrounds.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div className="px-4 py-4 space-y-3">
        {bookmarkedGrounds.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-tertiary font-medium text-sm">No bookmarks yet</p>
            <p className="text-text-tertiary text-xs mt-1">Tap the bookmark icon on any ground on the map</p>
          </div>
        ) : (
          bookmarkedGrounds.map(({ bookmark, ground }) => (
            <div key={bookmark.id} className="bg-surface rounded-2xl p-4 border border-divider shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center flex-shrink-0 text-lg">
                  {ground.isStadium ? '🏟️' : '⚽'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm truncate">{ground.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-text-tertiary" />
                    <span className="text-text-tertiary text-xs">
                      {ground.city || 'Unknown city'}{ground.bundesland ? `, ${ground.bundesland}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {ground.isStadium && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-primary/10 text-accent-primary rounded-full text-xs">
                        <Building2 className="w-3 h-3" />Stadium
                      </span>
                    )}
                    {ground.floodlights && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-warning/10 text-warning rounded-full text-xs">
                        <Zap className="w-3 h-3" />Floodlights
                      </span>
                    )}
                    {ground.capacity != null && (
                      <span className="px-2 py-0.5 bg-background text-text-secondary rounded-full text-xs">
                        {ground.capacity.toLocaleString('de-DE')} cap.
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => openInMaps(ground)}
                    className="w-8 h-8 rounded-xl bg-info/10 flex items-center justify-center flex-shrink-0"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-4 h-4 text-info" />
                  </button>
                  <button
                    onClick={() => removeBookmark(bookmark.groundId)}
                    className="w-8 h-8 rounded-xl bg-background flex items-center justify-center flex-shrink-0"
                    title="Remove bookmark"
                  >
                    <BookmarkX className="w-4 h-4 text-text-tertiary" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
