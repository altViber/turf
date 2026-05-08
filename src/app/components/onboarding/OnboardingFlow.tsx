import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Train, Users, Award, Calendar, Navigation } from 'lucide-react';

// ── Shared helpers ────────────────────────────────────────────────────────────

function ClusterPill({
  x, y, count, large = false,
}: {
  x: string; y: string; count: number; large?: boolean;
}) {
  const size = large ? 52 : count > 8 ? 42 : 34;
  const fontSize = large ? 14 : 11;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
    >
      {/* Ping ring */}
      <div
        className="absolute rounded-full opacity-40"
        style={{
          width: size * 1.7,
          height: size * 1.7,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          background: 'rgba(34,197,94,0.35)',
          animation: 'groundPing 2.4s cubic-bezier(0,0,0.2,1) infinite',
          animationDelay: large ? '0s' : `${(count % 5) * 0.4}s`,
        }}
      />
      <div
        className="relative rounded-full flex items-center justify-center font-bold text-white shadow-md"
        style={{
          width: size,
          height: size,
          fontSize,
          background: large
            ? 'linear-gradient(135deg,var(--accent-primary),var(--accent-primary))'
            : count > 8
            ? 'linear-gradient(135deg,var(--accent-primary),var(--accent-primary))'
            : 'linear-gradient(135deg,var(--accent-primary),var(--accent-primary))',
          border: '2.5px solid #fff',
          boxShadow: '0 3px 10px rgba(22,163,74,0.4)',
        }}
      >
        {count}
      </div>
    </div>
  );
}

function GroundDot({
  x, y, stadium = false,
}: {
  x: string; y: string; stadium?: boolean;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
      style={{
        left: x,
        top: y,
        width: stadium ? 14 : 10,
        height: stadium ? 14 : 10,
        background: stadium ? 'var(--accent-primary)' : 'var(--accent-primary)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}
    />
  );
}

// ── Screen 1: Map & Grounds ───────────────────────────────────────────────────

function MapVisual() {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background: 'linear-gradient(160deg,#cde9c8 0%,#ddefc9 40%,#c8e3b6 100%)',
      }}
    >
      {/* Map tile grid */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Faint road lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 360 280" preserveAspectRatio="xMidYMid slice">
        <path d="M0 140 Q90 100 180 140 Q270 180 360 140" stroke="#fff" strokeWidth="3" fill="none" />
        <path d="M120 0 Q140 70 130 140 Q120 210 140 280" stroke="#fff" strokeWidth="2" fill="none" />
        <path d="M0 60 Q80 80 200 60 Q280 45 360 70" stroke="#fff" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Clusters */}
      <ClusterPill x="48%" y="42%" count={24} large />
      <ClusterPill x="26%" y="58%" count={11} />
      <ClusterPill x="68%" y="62%" count={8} />
      <ClusterPill x="72%" y="28%" count={5} />
      <ClusterPill x="20%" y="30%" count={3} />
      <ClusterPill x="55%" y="75%" count={2} />

      {/* Individual ground dots at edges */}
      <GroundDot x="83%" y="38%" stadium />
      <GroundDot x="78%" y="50%" />
      <GroundDot x="88%" y="58%" />
      <GroundDot x="14%" y="66%" />
      <GroundDot x="36%" y="22%" stadium />
    </div>
  );
}

// ── Screen 2: Rail Mode ───────────────────────────────────────────────────────

function RailVisual() {
  const lineColor = 'var(--error)';
  const linePoints = [
    { x: 180, y: 30 },
    { x: 155, y: 75 },
    { x: 170, y: 118 },
    { x: 145, y: 160 },
    { x: 165, y: 202 },
    { x: 180, y: 250 },
  ];

  const groundsAt = [
    { cx: 148, cy: 90, r: 8 },
    { cx: 178, cy: 138, r: 9 },
    { cx: 150, cy: 178, r: 7 },
  ];

  const pathD = linePoints.reduce((d, p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`;
    const prev = linePoints[i - 1];
    const cpx = (prev.x + p.x) / 2;
    const cpy = (prev.y + p.y) / 2;
    return `${d} Q${prev.x} ${prev.y} ${cpx} ${cpy}`;
  }, '');

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-background">
      {/* Background circles for depth */}
      <div className="absolute w-48 h-48 rounded-full bg-accent-primary/10 opacity-60" style={{ top: '5%', left: '50%', transform: 'translateX(-50%)' }} />
      <div className="absolute w-32 h-32 rounded-full bg-accent-primary/10 opacity-80" style={{ bottom: '8%', right: '20%' }} />

      {/* RE line badge */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-md"
        style={{ background: lineColor }}
      >
        <Train className="w-3.5 h-3.5" />
        RE 7 · Köln – Münster
      </div>

      <svg viewBox="0 0 360 280" className="w-full" style={{ maxHeight: 240 }}>
        {/* 30-min reach radius hint (translucent circle around mid station) */}
        <circle cx="178" cy="138" r="52" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" strokeDasharray="4 3" />

        {/* Rail line */}
        <path d={pathD} stroke={lineColor} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Line glow */}
        <path d={pathD} stroke={lineColor} strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />

        {/* Station dots on line */}
        {linePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill="#fff" stroke={lineColor} strokeWidth="2.5" />
        ))}

        {/* Ground circles near stations */}
        {groundsAt.map((g, i) => (
          <g key={i}>
            <circle cx={g.cx} cy={g.cy} r={g.r + 3} fill="rgba(34,197,94,0.2)" />
            <circle cx={g.cx} cy={g.cy} r={g.r} fill="var(--accent-primary)" stroke="#fff" strokeWidth="2.5" />
          </g>
        ))}

        {/* Start pill */}
        <rect x="118" y="12" width="64" height="22" rx="11" fill={lineColor} />
        <text x="150" y="26.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">Start</text>

        {/* End pill */}
        <rect x="118" y="256" width="64" height="22" rx="11" fill={lineColor} />
        <text x="150" y="270.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">End</text>
      </svg>

      {/* 30 min hint */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-surface rounded-xl px-2 py-1.5 shadow text-center border border-divider">
        <p className="text-text-tertiary text-xs">⏱ 30 min</p>
        <p className="text-text-secondary text-xs font-semibold">Radius</p>
      </div>
    </div>
  );
}

// ── Screen 3: Groups & Planning ───────────────────────────────────────────────

function GroupsVisual() {
  const members = [
    { initials: 'MM', color: 'var(--accent-primary)' },
    { initials: 'JS', color: 'var(--info)' },
    { initials: 'AK', color: 'var(--accent-primary)' },
    { initials: 'LR', color: 'var(--warning)' },
  ];

  return (
    <div className="flex flex-col gap-3 px-5 pt-6 pb-4 w-full">
      {/* Group card */}
      <div className="bg-surface rounded-2xl px-4 py-3.5 shadow-sm border border-divider">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚽</span>
          <div className="flex-1">
            <p className="text-foreground font-bold text-sm">Ruhr Groundhoppers</p>
            <p className="text-text-tertiary text-xs mt-0.5">4 Mitglieder · 12 Besuche</p>
          </div>
          {/* Avatars */}
          <div className="flex -space-x-2">
            {members.map((m) => (
              <div
                key={m.initials}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ background: m.color, fontSize: 9 }}
              >
                {m.initials}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming event card */}
      <div className="bg-accent-primary rounded-2xl px-4 py-3.5 shadow-md text-white relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white opacity-10" />
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5 text-white/70" />
          <span className="text-white/70 text-xs font-medium">Nächstes Event</span>
        </div>
        <p className="font-bold text-base leading-tight">Dortmund Stadionrunde</p>
        <div className="flex items-center gap-1.5 mt-2">
          <MapPin className="w-3 h-3 text-white/60 shrink-0" />
          <span className="text-white/80 text-xs">Signal Iduna Park · Sa, 15 Mrz</span>
        </div>
      </div>

      {/* Second event (faded) */}
      <div className="bg-surface rounded-2xl px-4 py-3 border border-divider opacity-60 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar className="w-3 h-3 text-text-tertiary" />
          <span className="text-text-tertiary text-xs">28 Mrz</span>
        </div>
        <p className="text-text-secondary font-semibold text-sm">Bochum Vereinsrunde</p>
        <div className="flex items-center gap-1 mt-1">
          <Navigation className="w-3 h-3 text-text-tertiary" />
          <span className="text-text-tertiary text-xs">Vonovia Ruhrstadion</span>
        </div>
      </div>
    </div>
  );
}

// ── Screen 4: Visits & Badges ─────────────────────────────────────────────────

function BadgesVisual() {
  const badges = [
    { icon: '🏟️', unlocked: true },
    { icon: '🚆', unlocked: true },
    { icon: '📸', unlocked: true },
    { icon: '🎫', unlocked: false },
    { icon: '🏆', unlocked: false },
    { icon: '🗺️', unlocked: true },
    { icon: '⭐', unlocked: false },
    { icon: '🌟', unlocked: false },
    { icon: '🎯', unlocked: false },
  ];

  return (
    <div className="flex flex-col gap-3 px-5 pt-6 pb-4 w-full">
      {/* Visit counter card */}
      <div
        className="rounded-2xl px-5 py-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,var(--accent-primary),var(--accent-primary))' }}
      >
        <div className="absolute -bottom-3 -right-3 w-20 h-20 rounded-full bg-white opacity-10" />
        <div className="absolute -top-4 -left-2 w-16 h-16 rounded-full bg-white opacity-5" />
        <p className="text-white text-xs font-medium opacity-80 mb-0.5">Bereits besucht</p>
        <p className="text-white font-bold text-4xl leading-none">27</p>
        <p className="text-white/70 text-sm mt-0.5">Grounds</p>
      </div>

      {/* Badge grid */}
      <div className="bg-surface rounded-2xl p-4 border border-divider shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-secondary font-semibold text-xs">Badges</p>
          <span className="text-text-tertiary text-xs">4 / 9 freigeschaltet</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`rounded-xl flex items-center justify-center aspect-square text-xl border ${
                b.unlocked
                  ? 'bg-accent-primary/10 border-accent-primary/30'
                  : 'bg-background border-divider opacity-40 grayscale'
              }`}
            >
              {b.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Screen configuration ──────────────────────────────────────────────────────

interface ScreenConfig {
  icon: React.ReactNode;
  headline: string;
  body: string;
  hint: string;
  visual: React.ReactNode;
  ctaLabel: string;
  accent: string;
}

const SCREENS: ScreenConfig[] = [
  {
    icon: <MapPin className="w-5 h-5" />,
    headline: 'Alle Fußballplätze\nin Deutschland.',
    body: 'Entdecke Outdoor-Fußballplätze auf einer interaktiven Karte.\nDorfplatz, Kunstrasen oder Stadion – alles ist sichtbar.',
    hint: 'Zoome rein, um einzelne Grounds zu sehen.',
    visual: <MapVisual />,
    ctaLabel: 'Weiter',
    accent: 'var(--accent-primary)',
  },
  {
    icon: <Train className="w-5 h-5" />,
    headline: 'Finde Grounds entlang\nvon RE-Linien.',
    body: 'Wähle dein Bundesland. Filtere nach einer oder mehreren RE-Linien. Sieh die Strecke direkt auf der Karte.',
    hint: 'Nur Grounds innerhalb von 30 Minuten werden angezeigt.',
    visual: <RailVisual />,
    ctaLabel: 'Weiter',
    accent: 'var(--error)',
  },
  {
    icon: <Users className="w-5 h-5" />,
    headline: 'Plane deine\nnächsten Grounds.',
    body: 'Erstelle Gruppen. Lege Events mit Datum und Treffpunkt fest. Alle Events sind chronologisch sortiert.',
    hint: 'Nur Gruppen-basierte Planung, kein globaler Planer.',
    visual: <GroupsVisual />,
    ctaLabel: 'Weiter',
    accent: 'var(--info)',
  },
  {
    icon: <Award className="w-5 h-5" />,
    headline: 'Logge Besuche.\nSammle Badges.',
    body: 'Checke bei einem Ground ein. Lade Fotos hoch. Verfolge deine Statistiken und erreiche Meilensteine.',
    hint: 'Badges werden automatisch freigeschaltet.',
    visual: <BadgesVisual />,
    ctaLabel: 'Zur Karte',
    accent: 'var(--accent-primary)',
  },
];

// ── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({
  total,
  current,
  accent,
}: {
  total: number;
  current: number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i === current ? accent : 'var(--border)',
          }}
        />
      ))}
    </div>
  );
}

// ── Main OnboardingFlow component ─────────────────────────────────────────────

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  const screen = SCREENS[current];
  const isLast = current === SCREENS.length - 1;

  const goNext = () => {
    if (!isLast) {
      setCurrent((c) => c + 1);
    } else {
      onComplete();
    }
  };

  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy + 5) isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -50) goNext();
    else if (deltaX > 50) goPrev();
  };

  return (
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes groundPing {
          0%   { transform: scale(0.9); opacity: 0.7; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
        @keyframes ob-btn-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(22,163,74,0); }
        }
      `}</style>

      <div className="fixed inset-0 bg-surface z-50 flex flex-col overflow-hidden select-none" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* ── Slide container ────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 4-panel horizontal strip */}
          <div
            className="flex h-full"
            style={{
              width: `${SCREENS.length * 100}%`,
              transform: `translateX(-${(current / SCREENS.length) * 100}%)`,
              transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}
          >
            {SCREENS.map((s, i) => (
              <div
                key={i}
                className="h-full flex flex-col"
                style={{ width: `${100 / SCREENS.length}%` }}
              >
                {/* Visual area */}
                <div className="min-h-0" style={{ flex: '1 1 45%' }}>
                  {s.visual}
                </div>

                {/* Text content */}
                <div className="bg-surface px-6 pt-5 pb-6 flex flex-col gap-3.5 shrink-0">
                  {/* Progress dots */}
                  <ProgressDots total={SCREENS.length} current={i} accent={s.accent} />

                  {/* Headline */}
                  <h1
                    className="text-foreground leading-tight"
                    style={{ fontSize: 26, fontWeight: 800, whiteSpace: 'pre-line' }}
                  >
                    {s.headline}
                  </h1>

                  {/* Body */}
                  <p
                    className="text-text-secondary leading-relaxed"
                    style={{ fontSize: 14, fontWeight: 450, whiteSpace: 'pre-line' }}
                  >
                    {s.body}
                  </p>

                  {/* Hint */}
                  <p className="text-xs font-medium" style={{ color: s.accent }}>
                    {s.hint}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={i === SCREENS.length - 1 ? onComplete : () => setCurrent(i + 1)}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 mt-1 active:scale-[0.97] transition-transform duration-150"
                    style={{
                      background: `linear-gradient(135deg,${s.accent},${s.accent}dd)`,
                      boxShadow: `0 6px 20px ${s.accent}55`,
                      animation: i === SCREENS.length - 1 ? 'ob-btn-pulse 2s ease-in-out infinite' : 'none',
                    }}
                  >
                    {s.ctaLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
