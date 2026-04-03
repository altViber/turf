import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import {
  format, isToday, isSameDay, startOfWeek, addDays, addWeeks,
} from 'date-fns';
import { de } from 'date-fns/locale';
import {
  MapPin, Calendar, ChevronRight, ChevronLeft, Map, Users, Locate, AlertCircle,
} from 'lucide-react';
import { getNearbyMatches, getUserLocation, type Match } from '../../services/matchService';

const LEAGUE_COLORS: Record<string, string> = {
  bl1: 'bg-red-100 text-red-700',
  bl2: 'bg-blue-100 text-blue-700',
  bl3: 'bg-amber-100 text-amber-700',
  dfb: 'bg-purple-100 text-purple-700',
};

// Fallback color for amateur/community leagues
const DEFAULT_LEAGUE_COLOR = 'bg-emerald-100 text-emerald-700';

const LEAGUE_LABELS: Record<string, string> = {
  bl1: '1. BL',
  bl2: '2. BL',
  bl3: '3. Liga',
  dfb: 'DFB-Pokal',
  RLW: 'RL West',
  rlno: 'RL Nordost',
  rlno_n: 'RL Nordost',
  OLW: 'Oberliga',
};

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { profile, events, groups, stats } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  // Match data state
  const [nearbyMatches, setNearbyMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch nearby matches on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setMatchesLoading(true);
        setMatchesError(null);
        const loc = await getUserLocation();
        if (cancelled) return;
        setUserLocation(loc);
        const matches = await getNearbyMatches(loc.lat, loc.lng, 50);
        if (cancelled) return;
        setNearbyMatches(matches);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof GeolocationPositionError
          ? 'Standortzugriff verweigert. Bitte erlaube den Zugriff in den Einstellungen.'
          : 'Spieldaten konnten nicht geladen werden.';
        setMatchesError(msg);
      } finally {
        if (!cancelled) setMatchesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Build set of date strings that have events or matches
  const eventDays = useMemo(() => {
    const days = new Set<string>();
    for (const e of events) {
      days.add(format(new Date(e.startDateTime), 'yyyy-MM-dd'));
    }
    for (const m of nearbyMatches) {
      days.add(format(new Date(m.matchDateTime), 'yyyy-MM-dd'));
    }
    return days;
  }, [events, nearbyMatches]);

  // Generate the 7 days of the displayed week
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter events & matches for selected day
  const selectedGroupEvents = events.filter((e) =>
    isSameDay(new Date(e.startDateTime), selectedDate)
  );
  const selectedMatches = nearbyMatches.filter((m) =>
    isSameDay(new Date(m.matchDateTime), selectedDate)
  );

  const totalSelected = selectedGroupEvents.length + selectedMatches.length;

  const getGroupName = (groupId: string) =>
    groups.find((g) => g.id === groupId)?.name ?? 'Gruppe';

  const getGroupEmoji = (groupId: string) =>
    groups.find((g) => g.id === groupId)?.emoji ?? '⚽';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  const selectedIsToday = isToday(selectedDate);

  const getFinalScore = (m: Match) => {
    const final = m.matchResults.find((r) => r.resultOrderID === 2);
    if (!final) return null;
    return `${final.pointsTeam1}:${final.pointsTeam2}`;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-5">
        <p className="text-gray-400 text-sm font-medium">
          {format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })}
        </p>
        <h1 className="text-gray-900 mt-1" style={{ fontSize: '24px', fontWeight: 700 }}>
          {greeting()}, {profile.displayName.split(' ')[0]}
        </h1>
        {userLocation && (
          <div className="flex items-center gap-1 mt-1.5 text-gray-300 text-xs">
            <Locate className="w-3 h-3" />
            <span>Spiele im Umkreis von 50 km</span>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Week Calendar Strip */}
        <section className="bg-white rounded-2xl border border-gray-100 p-3">
          {/* Month & week navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {format(weekStart, 'MMMM yyyy', { locale: de })}
            </span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const hasEvent = eventDays.has(dayStr);
              const isSelected = isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-green-600 text-white'
                      : today
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-medium ${
                    isSelected ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {format(day, 'EEEEE', { locale: de })}
                  </span>
                  <span className={`text-sm font-semibold mt-0.5 ${
                    isSelected ? 'text-white' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {/* Event dot */}
                  <div className="h-1.5 mt-0.5">
                    {hasEvent && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-green-500'
                      }`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Matches & Events for selected day */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-gray-900 text-sm font-semibold">
              {selectedIsToday
                ? 'Heute auf dem Platz'
                : format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
            </span>
            {totalSelected > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalSelected}
              </span>
            )}
          </div>

          {/* Loading state */}
          {matchesLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-400 text-sm">Spiele werden geladen…</span>
            </div>
          )}

          {/* Error state */}
          {matchesError && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-3 flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-amber-700 text-xs">{matchesError}</span>
            </div>
          )}

          {/* No events */}
          {!matchesLoading && totalSelected === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚽</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                Keine Spiele {selectedIsToday ? 'für heute' : 'an diesem Tag'} in deiner Nähe
              </p>
              <p className="text-gray-300 text-xs mt-1">
                Blättere durch die Woche, um Spieltage zu finden.
              </p>
            </div>
          )}

          {/* Nearby matches from OpenLigaDB */}
          {selectedMatches.length > 0 && (
            <div className="space-y-3 mb-3">
              {selectedMatches
                .sort((a, b) => new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime())
                .map((match) => {
                  const score = getFinalScore(match);
                  return (
                    <div
                      key={match.matchID}
                      className="bg-white rounded-2xl border border-gray-100 p-4"
                    >
                      {/* League badge + time */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          LEAGUE_COLORS[match.leagueShortcut] ?? DEFAULT_LEAGUE_COLOR
                        }`}>
                          {LEAGUE_LABELS[match.leagueShortcut] ?? match.leagueName.replace(/\s*\d{4}.*/, '')}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {format(new Date(match.matchDateTime), 'HH:mm')} Uhr
                        </span>
                      </div>

                      {/* Teams */}
                      <div className="flex items-center gap-3">
                        {/* Home */}
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <img
                            src={match.team1.teamIconUrl}
                            alt=""
                            className="w-7 h-7 object-contain flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {match.team1.shortName || match.team1.teamName}
                          </span>
                        </div>

                        {/* Score or vs */}
                        <div className="flex-shrink-0 px-2">
                          {match.matchIsFinished && score ? (
                            <span className="text-sm font-bold text-gray-900 tabular-nums">{score}</span>
                          ) : (
                            <span className="text-xs text-gray-300 font-medium">vs</span>
                          )}
                        </div>

                        {/* Away */}
                        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                          <span className="text-sm font-semibold text-gray-900 truncate text-right">
                            {match.team2.shortName || match.team2.teamName}
                          </span>
                          <img
                            src={match.team2.teamIconUrl}
                            alt=""
                            className="w-7 h-7 object-contain flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      </div>

                      {/* Ground info */}
                      {match.ground && (
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-gray-50">
                          <MapPin className="w-3 h-3 text-gray-300" />
                          <span className="text-xs text-gray-400 truncate">
                            {match.ground.name} — {match.ground.city}
                          </span>
                          {match.ground.capacity && (
                            <span className="text-xs text-gray-300 ml-auto flex-shrink-0">
                              {match.ground.capacity.toLocaleString('de-DE')} Plätze
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Group events */}
          {selectedGroupEvents.length > 0 && (
            <div className="space-y-3">
              {selectedMatches.length > 0 && (
                <div className="flex items-center gap-2 mt-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Deine Events</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}
              {selectedGroupEvents.map((event) => {
                const ground = event.groundData;
                return (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/planner/groups/${event.groupId}`)}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 text-left transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-xl flex-shrink-0">
                        {getGroupEmoji(event.groupId)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-900 font-semibold text-sm truncate">
                            {ground?.name ?? 'Unbekannter Ground'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-gray-300" />
                          <span className="text-gray-400 text-xs truncate">
                            {ground?.city ?? ''}{ground?.bundesland ? `, ${ground.bundesland}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-green-600 text-xs font-semibold">
                            {format(new Date(event.startDateTime), 'HH:mm')} Uhr
                          </span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-300" />
                            <span className="text-gray-400 text-xs">
                              {getGroupName(event.groupId)}
                            </span>
                          </div>
                        </div>
                        {ground?.capacity && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-gray-300 text-xs">
                              {ground.isStadium ? '🏟️' : '⚽'} {ground.capacity.toLocaleString('de-DE')} Plätze
                            </span>
                            {ground.floodlights && (
                              <span className="text-gray-300 text-xs">💡 Flutlicht</span>
                            )}
                          </div>
                        )}
                        {event.meetingPoint && (
                          <div className="mt-1.5 text-xs text-gray-400">
                            Treffpunkt: {event.meetingPoint.label}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Deine Stats</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: stats.totalGroundsVisited, label: 'Grounds', icon: '⚽' },
              { value: stats.bundeslaenderCount, label: 'Bundesländer', icon: '🗺️' },
              { value: stats.totalPhotos, label: 'Fotos', icon: '📷' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
                <span className="text-lg">{s.icon}</span>
                <p className="text-gray-900 font-bold text-lg mt-0.5">{s.value}</p>
                <p className="text-gray-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <button
            onClick={() => navigate('/map')}
            className="w-full flex items-center gap-3 bg-green-600 text-white rounded-2xl p-4 transition-all active:scale-[0.98]"
          >
            <Map className="w-5 h-5" />
            <span className="font-semibold text-sm">Karte erkunden</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
          </button>
        </section>
      </div>
    </div>
  );
}
