import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, CalendarX, MapPin } from 'lucide-react';
import { format, isAfter, isToday } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { grounds as staticGrounds } from '../../data/grounds';
import type { GroupEvent, Ground, PlaceType } from '../../types';

function resolveGround(ev: GroupEvent): Ground | undefined {
  return ev.groundData ?? staticGrounds.find((g) => g.id === ev.groundId);
}

function PlaceTypeIcon({ type }: { type: PlaceType }) {
  return <span>{{ station: '🚉', pub: '🍺', kiosk: '☕', address: '📍', other: '📌' }[type]}</span>;
}

function EventCard({ event, isNext, groupColor }: {
  event: GroupEvent; isNext: boolean; groupColor: string;
}) {
  const ground = resolveGround(event);
  const dt = new Date(event.startDateTime);
  const isPast = !isAfter(dt, new Date());
  const tonight = isToday(dt) && !isPast;

  return (
    <div
      className={`bg-surface rounded-2xl p-4 border transition-all ${
        isNext ? 'border-2 shadow-sm' : isPast ? 'border border-divider opacity-55' : 'border border-divider shadow-sm'
      }`}
      style={isNext ? { borderColor: groupColor } : undefined}
    >
      {/* Badges + date */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {isNext && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${groupColor}18`, color: groupColor }}>
              ● Next up
            </span>
          )}
          {tonight && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning">
              ● Tonight
            </span>
          )}
          {isPast && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-surface-muted text-text-tertiary">Past</span>
          )}
        </div>
        <p className="text-foreground font-semibold text-base">{format(dt, 'EEEE d MMMM')}</p>
        <p className="text-text-tertiary text-sm">{format(dt, 'HH:mm')} Uhr</p>
      </div>

      {/* Ground */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${groupColor}14` }}
        >
          <MapPin className="w-3.5 h-3.5" style={{ color: groupColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-foreground font-medium text-sm truncate">{ground?.name ?? 'Unknown ground'}</p>
          <p className="text-text-tertiary text-xs truncate">
            {ground?.city ?? '—'}{ground?.bundesland ? `, ${ground.bundesland}` : ''}
          </p>
        </div>
      </div>

      {/* Meeting point */}
      {event.meetingPoint && (
        <div className="flex items-start gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
            <PlaceTypeIcon type={event.meetingPoint.type} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-foreground font-medium text-sm truncate">{event.meetingPoint.label}</p>
              <span className="px-1.5 py-0.5 rounded-full bg-info/10 text-info text-xs font-medium flex-shrink-0">
                {event.meetingPoint.type}
              </span>
            </div>
            {event.meetingPoint.address && (
              <p className="text-text-tertiary text-xs truncate">{event.meetingPoint.address}</p>
            )}
          </div>
        </div>
      )}

      {/* Note */}
      {event.note && (
        <div className="mt-2 pt-2 border-t border-divider">
          <p className="text-text-tertiary text-xs leading-relaxed">{event.note}</p>
        </div>
      )}
    </div>
  );
}

export function GroupDetailScreen() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups, getGroupEvents } = useApp();

  const group = groups.find((g) => g.id === groupId);
  if (!group) return (
    <div className="h-full flex items-center justify-center text-text-tertiary text-sm">
      Group not found
    </div>
  );

  const sortedEvents = getGroupEvents(group.id);
  const now = new Date();
  const upcomingEvents = sortedEvents.filter((e) => isAfter(new Date(e.startDateTime), now));
  const pastEvents = sortedEvents.filter((e) => !isAfter(new Date(e.startDateTime), now));
  const nextId = upcomingEvents[0]?.id;

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="px-4 pt-12 pb-3">
          <button onClick={() => navigate('/planner')} className="flex items-center gap-1.5 text-text-tertiary text-sm mb-3 -ml-0.5">
            <ArrowLeft className="w-4 h-4" />
            Groups
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${group.color}18` }}>
              {group.emoji}
            </div>
            <div>
              <h1 className="text-foreground leading-snug" style={{ fontSize: '20px', fontWeight: 700 }}>
                {group.name}
              </h1>
              {group.description && <p className="text-text-tertiary text-xs">{group.description}</p>}
            </div>
          </div>
        </div>
        {/* Members */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <div className="flex -space-x-2">
            {group.members.slice(0, 7).map((m) => (
              <div
                key={m.id}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center"
                style={{ backgroundColor: m.avatarColor, fontSize: '10px', color: '#fff', fontWeight: 600 }}
              >
                {m.avatarInitials}
              </div>
            ))}
          </div>
          <span className="text-text-tertiary text-xs">{group.members.length} members</span>
        </div>
      </div>

      {/* Create event button */}
      <div className="px-4 py-4">
        <button
          onClick={() => navigate(`/planner/groups/${group.id}/new-event`)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm active:opacity-80"
          style={{ backgroundColor: group.color }}
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Events */}
      <div className="px-4 pb-8">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-14">
            <CalendarX className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-tertiary font-medium text-sm">No events yet</p>
            <p className="text-text-tertiary text-xs mt-1">Create an event to get started</p>
          </div>
        ) : (
          <>
            {upcomingEvents.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Upcoming</span>
                  <div className="flex-1 h-px bg-surface-muted" />
                  <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: group.color }}>
                    {upcomingEvents.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((ev) => (
                    <EventCard key={ev.id} event={ev} isNext={ev.id === nextId} groupColor={group.color} />
                  ))}
                </div>
              </div>
            )}
            {pastEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Past</span>
                  <div className="flex-1 h-px bg-surface-muted" />
                </div>
                <div className="space-y-3">
                  {pastEvents.map((ev) => (
                    <EventCard key={ev.id} event={ev} isNext={false} groupColor={group.color} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
