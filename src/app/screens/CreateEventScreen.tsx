import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, ArrowRight, Star, Check, Search, X, Train,
  Beer, Coffee, Navigation, MapPin, CalendarDays, Clock, FileText, ChevronRight, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { grounds } from '../../data/grounds';
import { mockPlaceSearchResults } from '../../data/placeSearch';
import { useApp } from '../../context/AppContext';
import type { Ground, MeetingPoint, PlaceType, PlaceSearchResult } from '../../types';

type Step = 1 | 2 | 3 | 4;

interface FormState {
  ground: Ground | null;
  date: string;
  time: string;
  meetingPoint: MeetingPoint | null;
  note: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PlaceIcon({ type, className }: { type: PlaceType; className?: string }) {
  switch (type) {
    case 'station': return <Train className={className} />;
    case 'pub': return <Beer className={className} />;
    case 'kiosk': return <Coffee className={className} />;
    case 'address': return <Navigation className={className} />;
    default: return <MapPin className={className} />;
  }
}

function placeTypeLabel(type: PlaceType) {
  return { station: 'Station', pub: 'Pub', kiosk: 'Kiosk', address: 'Address', other: 'Place' }[type];
}

function surfaceLabel(surface?: string) {
  return { grass: '🌿 Grass', artificial: '⚡ Astro', indoor: '🏠 Indoor' }[surface ?? ''] ?? '';
}

function searchPlaces(q: string): PlaceSearchResult[] {
  if (!q.trim()) return [];
  const ql = q.toLowerCase();
  return mockPlaceSearchResults.filter(
    (p) => p.label.toLowerCase().includes(ql) || (p.address?.toLowerCase().includes(ql) ?? false)
  );
}

// ─── Step 1: Ground ───────────────────────────────────────────────────────────

function StepGround({ form, onSelect, groupColor, bookmarkedIds, bookmarkedGrounds }: {
  form: FormState;
  onSelect: (g: Ground) => void;
  groupColor: string;
  bookmarkedIds: Set<string>;
  bookmarkedGrounds: Ground[];
}) {
  const [query, setQuery] = useState('');
  const filter = (list: Ground[]) =>
    query
      ? list.filter((g) =>
          g.name.toLowerCase().includes(query.toLowerCase()) ||
          g.city.toLowerCase().includes(query.toLowerCase())
        )
      : list;

  // Merge bookmarked grounds (from Supabase) + static dataset, de-dup by ID
  const allGrounds = useMemo(() => {
    const seen = new Set<string>();
    const merged: Ground[] = [];
    for (const g of [...bookmarkedGrounds, ...grounds]) {
      if (!seen.has(g.id)) { seen.add(g.id); merged.push(g); }
    }
    return merged;
  }, [bookmarkedGrounds]);

  const bookmarked = filter(allGrounds.filter((g) => bookmarkedIds.has(g.id)));
  const others = filter(allGrounds.filter((g) => !bookmarkedIds.has(g.id)));

  const Row = ({ g }: { g: Ground }) => {
    const sel = form.ground?.id === g.id;
    return (
      <button
        onClick={() => onSelect(g)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
          sel ? 'border-2' : 'border border-divider bg-surface'
        }`}
        style={sel ? { borderColor: groupColor, backgroundColor: `${groupColor}08` } : undefined}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
          style={{ backgroundColor: sel ? `${groupColor}20` : '#f3f4f6' }}
        >
          {g.isStadium ? '🏟️' : '⚽'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground font-medium text-sm truncate">{g.name}</span>
            {bookmarkedIds.has(g.id) && <Star className="w-3 h-3 text-warning fill-warning flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-text-tertiary text-xs truncate">{g.address ?? g.city}, {g.bundesland}</span>
            {g.surface && <span className="text-text-tertiary text-xs flex-shrink-0">{surfaceLabel(g.surface)}</span>}
          </div>
        </div>
        {sel && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: groupColor }}
          >
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-3 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-text-tertiary flex-shrink-0" />
          <input
            type="text"
            placeholder="Search grounds…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-text-secondary placeholder-text-tertiary outline-none text-sm"
          />
          {query && <button onClick={() => setQuery('')}><X className="w-4 h-4 text-text-tertiary" /></button>}
        </div>
      </div>
      <div className="px-4 pb-4 space-y-4">
        {bookmarked.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Star className="w-3.5 h-3.5 text-warning fill-warning" />
              <span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Bookmarked</span>
            </div>
            <div className="space-y-2">{bookmarked.map((g) => <Row key={g.id} g={g} />)}</div>
          </div>
        )}
        {others.length > 0 && (
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold mb-2">All Grounds</p>
            <div className="space-y-2">{others.map((g) => <Row key={g.id} g={g} />)}</div>
          </div>
        )}
        {bookmarked.length === 0 && others.length === 0 && (
          <div className="text-center py-10 text-text-tertiary text-sm">No matches for "{query}"</div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Date & Time ──────────────────────────────────────────────────────

function StepDateTime({ form, onChange }: { form: FormState; onChange: (d: string, t: string) => void }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const QUICK_TIMES = ['09:00', '10:00', '11:00', '14:00', '17:00', '18:00', '19:00', '20:00'];
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-surface rounded-2xl p-4 border border-divider">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-info" />
          </div>
          <label className="text-text-secondary font-semibold text-sm">Date</label>
        </div>
        <input
          type="date"
          min={today}
          value={form.date}
          onChange={(e) => onChange(e.target.value, form.time)}
          className="w-full bg-background border border-border rounded-xl px-3 py-3 text-text-secondary text-sm outline-none focus:border-info"
        />
      </div>
      <div className="bg-surface rounded-2xl p-4 border border-divider">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-accent-primary" />
          </div>
          <label className="text-text-secondary font-semibold text-sm">Kick-off time</label>
        </div>
        <input
          type="time"
          value={form.time}
          onChange={(e) => onChange(form.date, e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-3 py-3 text-text-secondary text-sm outline-none focus:border-accent-primary"
        />
        <div className="flex gap-2 flex-wrap mt-3">
          {QUICK_TIMES.map((t) => (
            <button
              key={t}
              onClick={() => onChange(form.date, t)}
              className={`px-2.5 py-1 rounded-lg border text-sm transition-all ${
                form.time === t ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border text-text-secondary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {form.date && form.time && (
        <div className="bg-accent-primary/10 border border-accent-primary/15 rounded-2xl p-3 text-center">
          <p className="text-accent-primary font-semibold text-sm">
            {format(new Date(`${form.date}T${form.time}`), "EEEE, d MMMM yyyy 'at' HH:mm")}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Meeting Point ────────────────────────────────────────────────────

function StepMeetingPoint({ form, onSelect, onClear }: {
  form: FormState; onSelect: (mp: MeetingPoint) => void; onClear: () => void;
}) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchPlaces(query), [query]);

  const typeBg = (t: PlaceType) => ({
    station: 'bg-accent-primary/10 text-accent-primary',
    pub: 'bg-warning/10 text-warning',
    kiosk: 'bg-warning/10 text-warning',
    address: 'bg-info/10 text-info',
    other: 'bg-background text-text-secondary',
  }[t]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {form.meetingPoint && (
        <div className="mb-3 bg-surface border-2 border-accent-primary/30 rounded-2xl p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeBg(form.meetingPoint.type)}`}>
                <PlaceIcon type={form.meetingPoint.type} className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground font-medium text-sm truncate">{form.meetingPoint.label}</p>
                {form.meetingPoint.address && <p className="text-text-tertiary text-xs truncate">{form.meetingPoint.address}</p>}
              </div>
            </div>
            <button onClick={onClear} className="w-6 h-6 rounded-full bg-surface-muted flex items-center justify-center flex-shrink-0">
              <X className="w-3 h-3 text-text-tertiary" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 mb-3">
        <Search className="w-4 h-4 text-text-tertiary flex-shrink-0" />
        <input
          type="text"
          placeholder="Search stations, pubs, addresses…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-text-secondary placeholder-text-tertiary text-sm outline-none"
        />
        {query && <button onClick={() => setQuery('')}><X className="w-4 h-4 text-text-tertiary" /></button>}
      </div>
      {!query && (
        <div className="flex gap-2 flex-wrap mb-3">
          {(['station', 'pub', 'kiosk', 'address'] as PlaceType[]).map((t) => (
            <button
              key={t}
              onClick={() => setQuery(placeTypeLabel(t))}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium ${typeBg(t)}`}
            >
              <PlaceIcon type={t} className="w-3.5 h-3.5" />
              {placeTypeLabel(t)}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {results.map((r) => {
          const sel = form.meetingPoint?.id === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelect({ id: r.id, label: r.label, type: r.type, address: r.address, coordinates: r.coordinates })}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                sel ? 'border-accent-primary/30 bg-accent-primary/10' : 'border-divider bg-surface'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeBg(r.type)}`}>
                <PlaceIcon type={r.type} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground font-medium text-sm truncate">{r.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs flex-shrink-0 ${typeBg(r.type)}`}>{placeTypeLabel(r.type)}</span>
                </div>
                {r.address && <p className="text-text-tertiary text-xs truncate">{r.address}</p>}
              </div>
              {sel && <Check className="w-4 h-4 text-accent-primary flex-shrink-0" />}
            </button>
          );
        })}
        {query && results.length === 0 && (
          <p className="text-center text-text-tertiary text-sm py-6">No results for "{query}"</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Note ─────────────────────────────────────────────────────────────

function StepNote({ form, onChange }: { form: FormState; onChange: (note: string) => void }) {
  return (
    <div className="px-4 py-4">
      <div className="bg-surface rounded-2xl p-4 border border-divider">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center">
            <FileText className="w-4 h-4 text-text-tertiary" />
          </div>
          <label className="text-text-secondary font-semibold text-sm">
            Note <span className="text-text-tertiary font-normal">(optional)</span>
          </label>
        </div>
        <textarea
          rows={5}
          placeholder="e.g. Bring bibs, cash only at the Kiosk, meet at Haupteingang…"
          value={form.note}
          onChange={(e) => onChange(e.target.value.slice(0, 280))}
          className="w-full bg-background border border-border rounded-xl px-3 py-3 text-text-secondary text-sm placeholder-text-tertiary outline-none resize-none focus:border-border-strong"
        />
        <div className="flex justify-end mt-1">
          <span className="text-text-tertiary text-xs">{form.note.length}/280</span>
        </div>
      </div>
    </div>
  );
}

// ─── Summary bar ──────────────────────────────────────────────────────────────

function SummaryBar({ form, groupColor }: { form: FormState; groupColor: string }) {
  if (!form.ground) return null;
  return (
    <div className="border-t border-divider bg-surface px-4 py-2">
      <div className="flex items-center gap-2 text-text-tertiary text-xs overflow-x-auto">
        <span className="flex items-center gap-1 flex-shrink-0">
          {form.ground.isStadium ? '🏟️' : '⚽'}
          <span className="max-w-[120px] truncate">{form.ground.name}</span>
        </span>
        {form.date && form.time && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0 text-text-tertiary" />
            <span className="flex-shrink-0">
              {format(new Date(`${form.date}T${form.time}`), "EEE d MMM 'at' HH:mm")}
            </span>
          </>
        )}
        {form.meetingPoint && (
          <>
            <ChevronRight className="w-3 h-3 flex-shrink-0 text-text-tertiary" />
            <span className="flex items-center gap-1 flex-shrink-0">
              🚉 <span className="max-w-[100px] truncate">{form.meetingPoint.label}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const STEPS = [
  { title: 'Select a ground', sub: 'Where are you playing?' },
  { title: 'Date & time', sub: 'When does it kick off?' },
  { title: 'Meeting point', sub: 'Where should everyone meet?' },
  { title: 'Add a note', sub: 'Anything the group should know?' },
];

export function CreateEventScreen() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups, addEvent, bookmarks } = useApp();

  const group = groups.find((g) => g.id === groupId);
  const bookmarkedIds = new Set(bookmarks.map((b) => b.groundId));
  // Bookmarked grounds with embedded groundData (from Supabase)
  const bookmarkedGrounds: Ground[] = bookmarks
    .filter((b) => b.groundData)
    .map((b) => b.groundData!);

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    ground: null,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '14:00',
    meetingPoint: null,
    note: '',
  });
  const [saving, setSaving] = useState(false);

  if (!group) return (
    <div className="h-full flex items-center justify-center text-text-tertiary text-sm">Group not found</div>
  );

  const stepInfo = STEPS[step - 1];
  const canProceed = step === 1 ? form.ground !== null : step === 2 ? !!form.date && !!form.time : true;

  const handleBack = () =>
    step === 1 ? navigate(`/planner/groups/${groupId}`) : setStep((s) => (s - 1) as Step);

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else {
      await handleCreate();
    }
  };

  const handleCreate = async () => {
    if (!form.ground) return;
    setSaving(true);
    try {
      await addEvent({
        groupId: group.id,
        groundId: form.ground.id,
        groundData: form.ground, // embed full ground data
        startDateTime: new Date(`${form.date}T${form.time}:00`).toISOString(),
        meetingPoint: form.meetingPoint ?? undefined,
        note: form.note.trim() || undefined,
        createdBy: 'm1',
      });
      navigate(`/planner/groups/${groupId}`);
    } catch (e) {
      console.error('Failed to create event:', e);
      setSaving(false);
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-divider sticky top-0 z-10">
        <div className="px-4 pt-12 pb-3">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-text-tertiary text-sm mb-3 -ml-0.5">
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? group.name : STEPS[step - 2].title}
          </button>
          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i + 1 === step ? 24 : 8, backgroundColor: i + 1 <= step ? group.color : '#e5e7eb' }}
              />
            ))}
          </div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-foreground leading-snug" style={{ fontSize: '20px', fontWeight: 700 }}>
                {stepInfo.title}
              </h1>
              <p className="text-text-tertiary text-xs">{stepInfo.sub}</p>
            </div>
            {(step === 3 || step === 4) && (
              <button onClick={handleNext} className="text-text-tertiary text-xs px-3 py-1 rounded-lg bg-surface-muted">
                Skip
              </button>
            )}
          </div>
        </div>
        {step > 1 && <SummaryBar form={form} groupColor={group.color} />}
      </div>

      {/* Step content */}
      <div className={`flex-1 flex flex-col ${step === 1 || step === 3 ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {step === 1 && (
          <StepGround
            form={form}
            onSelect={(g) => setForm((f) => ({ ...f, ground: g }))}
            groupColor={group.color}
            bookmarkedIds={bookmarkedIds}
            bookmarkedGrounds={bookmarkedGrounds}
          />
        )}
        {step === 2 && (
          <StepDateTime
            form={form}
            onChange={(d, t) => setForm((f) => ({ ...f, date: d, time: t }))}
          />
        )}
        {step === 3 && (
          <StepMeetingPoint
            form={form}
            onSelect={(mp) => setForm((f) => ({ ...f, meetingPoint: mp }))}
            onClear={() => setForm((f) => ({ ...f, meetingPoint: null }))}
          />
        )}
        {step === 4 && (
          <StepNote
            form={form}
            onChange={(n) => setForm((f) => ({ ...f, note: n }))}
          />
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-surface border-t border-divider px-4 py-4 pb-8">
        <button
          onClick={handleNext}
          disabled={!canProceed || saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm disabled:opacity-30"
          style={{ backgroundColor: group.color }}
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {step === 4 ? (
            saving ? 'Creating…' : <><Check className="w-5 h-5" />Create Event</>
          ) : (
            <>{STEPS[step].title}<ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
