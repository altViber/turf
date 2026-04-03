import { ExternalLink, Bookmark, BookmarkCheck, Camera, MapPin, Users, Zap, Building2, Tag } from 'lucide-react';
import { Drawer } from 'vaul';
import type { Ground } from '../../../types';
import { useApp } from '../../../context/AppContext';

interface GroundBottomSheetProps {
  ground: Ground | null;
  onClose: () => void;
  onLogVisit: () => void;
}

function AmenityIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    parking: '🅿️', toilets: '🚻', cafe: '☕', shop: '🛍️',
    bar: '🍺', changing_rooms: '👕', floodlights: '💡',
  };
  return <span>{icons[type] ?? '📍'}</span>;
}

function SurfaceTag({ surface }: { surface?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    grass: { label: '🌿 Grass', cls: 'bg-accent-primary/10 text-accent-primary' },
    artificial: { label: '⚡ Astro', cls: 'bg-warning/10 text-warning' },
    sand: { label: '🏖️ Sand', cls: 'bg-warning/10 text-warning' },
    indoor: { label: '🏠 Indoor', cls: 'bg-info/10 text-info' },
  };
  const s = map[surface ?? ''];
  if (!s) return null;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

export function GroundBottomSheet({ ground, onClose, onLogVisit }: GroundBottomSheetProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useApp();

  const open = ground !== null;
  const bookmarked = ground ? isBookmarked(ground.id) : false;

  const toggleBookmark = () => {
    if (!ground) return;
    bookmarked ? removeBookmark(ground.id) : addBookmark(ground.id, ground);
  };

  const openGoogleMaps = () => {
    if (!ground) return;
    const q = encodeURIComponent(`${ground.name}, ${ground.city}, Germany`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
  };

  return (
    <Drawer.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-surface-elevated max-h-[85vh]">
          {/* Visually-hidden title/description required by Radix Dialog (vaul wraps it) */}
          <Drawer.Title className="sr-only">
            {ground?.name ?? 'Ground Details'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Details, amenities and actions for {ground?.name ?? 'this ground'}.
          </Drawer.Description>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          <div className="overflow-y-auto px-5 pb-8">
            {ground && (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 mt-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {ground.isStadium && (
                        <span className="px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary text-xs font-medium">
                          Stadium
                        </span>
                      )}
                      <SurfaceTag surface={ground.surface} />
                    </div>
                    <h2 className="text-foreground leading-snug" style={{ fontSize: '20px', fontWeight: 700 }}>
                      {ground.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-text-tertiary" />
                      <span className="text-text-secondary text-sm">
                        {ground.city}, {ground.bundesland}
                      </span>
                    </div>
                    {ground.address && (
                      <p className="text-text-tertiary text-xs mt-0.5">{ground.address}</p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 mb-4">
                  {ground.capacity && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-background rounded-xl">
                      <Users className="w-4 h-4 text-text-tertiary" />
                      <span className="text-text-secondary text-sm font-medium">
                        {ground.capacity.toLocaleString('de-DE')}
                      </span>
                    </div>
                  )}
                  {ground.floodlights && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-warning/10 rounded-xl">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="text-warning text-sm font-medium">Floodlights</span>
                    </div>
                  )}
                  {ground.isStadium && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-accent-primary/10 rounded-xl">
                      <Building2 className="w-4 h-4 text-accent-primary" />
                      <span className="text-accent-primary text-sm font-medium">Stadium</span>
                    </div>
                  )}
                </div>

                {/* OSM Tags */}
                {ground.osmTags && Object.keys(ground.osmTags).length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag className="w-3.5 h-3.5 text-text-tertiary" />
                      <span className="text-text-secondary text-xs font-medium uppercase tracking-wide">OSM Tags</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(ground.osmTags).map(([k, v]) => (
                        <span key={k} className="px-2 py-1 bg-surface-muted rounded-lg text-text-secondary text-xs">
                          {k}={v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {ground.amenities && ground.amenities.length > 0 && (
                  <div className="mb-5">
                    <p className="text-text-secondary text-xs font-medium uppercase tracking-wide mb-2">Amenities</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ground.amenities.map((a) => (
                        <div key={a.type} className="flex items-center gap-2 px-3 py-2 bg-background rounded-xl">
                          <AmenityIcon type={a.type} />
                          <span className="text-text-secondary text-sm">{a.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={toggleBookmark}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
                      bookmarked
                        ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary'
                        : 'bg-background border-border text-text-secondary'
                    }`}
                  >
                    {bookmarked
                      ? <BookmarkCheck className="w-5 h-5" />
                      : <Bookmark className="w-5 h-5" />}
                    <span className="text-xs font-medium">{bookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>

                  <button
                    onClick={() => { onClose(); onLogVisit(); }}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-accent-primary text-white"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-xs font-medium">Log Visit</span>
                  </button>

                  <button
                    onClick={openGoogleMaps}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-info/10 border border-info/20 text-info"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="text-xs font-medium">Maps</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}