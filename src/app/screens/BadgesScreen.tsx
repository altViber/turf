import { useNavigate } from 'react-router';
import { badgeDefinitions } from '../../data/badgeDefinitions';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Lock } from 'lucide-react';
import type { Badge, BadgeCategory } from '../../types';

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  quantitative: 'Grounds Visited',
  rail: 'Rail Hopping',
  variety: 'Variety',
  group: 'Group Play',
  documentation: 'Documentation',
};

const CATEGORY_ICONS: Record<BadgeCategory, string> = {
  quantitative: '🏟️',
  rail: '🚆',
  variety: '🎯',
  group: '👥',
  documentation: '📷',
};

function BadgeCard({ badge, unlocked, progress }: {
  badge: Badge;
  unlocked: boolean;
  progress: { current: number; threshold: number };
}) {
  const pct = Math.min(100, Math.round((progress.current / progress.threshold) * 100));

  return (
    <div className={`bg-surface rounded-2xl p-4 border transition-all ${
      unlocked ? 'border-accent-primary/30 shadow-sm' : 'border-divider opacity-70'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
          unlocked ? 'bg-accent-primary/10' : 'bg-surface-muted'
        }`}>
          {unlocked ? badge.icon : <Lock className="w-5 h-5 text-text-tertiary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-foreground font-semibold text-sm">{badge.name}</span>
            {unlocked && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary text-xs font-medium">✓</span>
            )}
          </div>
          <p className="text-text-tertiary text-xs leading-snug">{badge.description}</p>
          {/* Progress bar */}
          {!unlocked && (
            <div className="mt-2">
              <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-primary rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-text-tertiary text-xs mt-0.5 text-right">
                {progress.current} / {progress.threshold}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BadgesScreen() {
  const navigate = useNavigate();
  const { unlockedBadges, visits, events, groups } = useApp();
  const { stats } = useApp();
  const unlockedIds = new Set(unlockedBadges.map((b) => b.badgeId));

  const getProgress = (badge: Badge): { current: number; threshold: number } => {
    const { type, threshold } = badge.requirement;
    let current = 0;
    switch (type) {
      case 'visits_count': current = new Set(visits.map((v) => v.groundId)).size; break;
      case 'bundesland_count': current = stats.bundeslaenderCount; break;
      case 'rail_grounds': current = stats.railGroundsCount; break;
      case 'floodlight_grounds': current = stats.railGroundsCount; break;
      case 'large_stadium_grounds': current = stats.totalGroundsVisited; break;
      case 'group_events': current = events.length; break;
      case 'group_visits': current = stats.groupVisits; break;
      case 'photos_count': current = stats.totalPhotos; break;
    }
    return { current, threshold };
  };

  const categories = [...new Set(badgeDefinitions.map((b) => b.category))] as BadgeCategory[];
  const unlocked = badgeDefinitions.filter((b) => unlockedIds.has(b.id));
  const locked = badgeDefinitions.filter((b) => !unlockedIds.has(b.id));

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-divider px-4 pt-12 pb-4 sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-text-tertiary text-sm mb-3">
          <ChevronLeft className="w-4 h-4" />Profile
        </button>
        <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 700 }}>Badges</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="px-3 py-1 bg-accent-primary/15 text-accent-primary rounded-full text-sm font-semibold">
            {unlocked.length} / {badgeDefinitions.length} unlocked
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">Unlocked</span>
              <div className="flex-1 h-px bg-surface-muted" />
              <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full bg-accent-primary">{unlocked.length}</span>
            </div>
            <div className="space-y-3">
              {unlocked.map((b) => (
                <BadgeCard key={b.id} badge={b} unlocked progress={getProgress(b)} />
              ))}
            </div>
          </div>
        )}

        {/* By category — locked */}
        {categories.map((cat) => {
          const catLocked = locked.filter((b) => b.category === cat);
          if (catLocked.length === 0) return null;
          return (
            <div key={cat} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                <span className="text-text-tertiary text-xs uppercase tracking-wider font-semibold">{CATEGORY_LABELS[cat]}</span>
                <div className="flex-1 h-px bg-surface-muted" />
              </div>
              <div className="space-y-3">
                {catLocked.map((b) => (
                  <BadgeCard key={b.id} badge={b} unlocked={false} progress={getProgress(b)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
