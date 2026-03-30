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
    grass: { label: '🌿 Grass', cls: 'bg-green-50 text-green-700' },
    artificial: { label: '⚡ Astro', cls: 'bg-yellow-50 text-yellow-700' },
    sand: { label: '🏖️ Sand', cls: 'bg-orange-50 text-orange-700' },
    indoor: { label: '🏠 Indoor', cls: 'bg-blue-50 text-blue-700' },
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
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-white max-h-[85vh]">
          {/* Visually-hidden title/description required by Radix Dialog (vaul wraps it) */}
          <Drawer.Title className="sr-only">
            {ground?.name ?? 'Ground Details'}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            Details, amenities and actions for {ground?.name ?? 'this ground'}.
          </Drawer.Description>

          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          <div className="overflow-y-auto px-5 pb-8">
            {ground && (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 mt-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {ground.isStadium && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Stadium
                        </span>
                      )}
                      <SurfaceTag surface={ground.surface} />
                    </div>
                    <h2 className="text-gray-900 leading-snug" style={{ fontSize: '20px', fontWeight: 700 }}>
                      {ground.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500 text-sm">
                        {ground.city}, {ground.bundesland}
                      </span>
                    </div>
                    {ground.address && (
                      <p className="text-gray-400 text-xs mt-0.5">{ground.address}</p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 mb-4">
                  {ground.capacity && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 text-sm font-medium">
                        {ground.capacity.toLocaleString('de-DE')}
                      </span>
                    </div>
                  )}
                  {ground.floodlights && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 rounded-xl">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-700 text-sm font-medium">Floodlights</span>
                    </div>
                  )}
                  {ground.isStadium && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-xl">
                      <Building2 className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 text-sm font-medium">Stadium</span>
                    </div>
                  )}
                </div>

                {/* OSM Tags */}
                {ground.osmTags && Object.keys(ground.osmTags).length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">OSM Tags</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(ground.osmTags).map(([k, v]) => (
                        <span key={k} className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600 text-xs">
                          {k}={v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {ground.amenities && ground.amenities.length > 0 && (
                  <div className="mb-5">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-2">Amenities</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ground.amenities.map((a) => (
                        <div key={a.type} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                          <AmenityIcon type={a.type} />
                          <span className="text-gray-600 text-sm">{a.label}</span>
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
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {bookmarked
                      ? <BookmarkCheck className="w-5 h-5" />
                      : <Bookmark className="w-5 h-5" />}
                    <span className="text-xs font-medium">{bookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>

                  <button
                    onClick={() => { onClose(); onLogVisit(); }}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-green-600 text-white"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-xs font-medium">Log Visit</span>
                  </button>

                  <button
                    onClick={openGoogleMaps}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700"
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