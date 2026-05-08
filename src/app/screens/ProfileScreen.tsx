import { useNavigate } from 'react-router';
import {
  MapPin, Train, Bookmark, Users, Award, TrendingUp, Camera, ChevronRight, Calendar, Edit2, PlayCircle,
  Sun, Moon, Monitor,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { badgeDefinitions } from '../../data/badgeDefinitions';
import { grounds as staticGrounds } from '../../data/grounds';
import { format } from 'date-fns';
import type { Ground, UserProfile } from '../../types';

function resolveGround(groundId: string, groundData?: Ground | null): Ground | undefined {
  return groundData ?? staticGrounds.find((g) => g.id === groundId);
}

function StatCard({
  label, value, icon, color,
}: {
  label: string; value: string | number; icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-surface rounded-2xl p-4 border border-divider shadow-sm">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>{icon}</div>
      <p className="text-foreground font-bold text-xl leading-none">{value}</p>
      <p className="text-text-tertiary text-xs mt-0.5">{label}</p>
    </div>
  );
}

function EditProfileModal({
  profile,
  onSave,
  onClose,
}: {
  profile: UserProfile;
  onSave: (p: UserProfile) => Promise<void>;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...profile, displayName: displayName.trim(), username: username.trim(), bio: bio.trim() || undefined });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-surface rounded-t-3xl px-5 pb-10 pt-5">
        <h2 className="text-foreground mb-4" style={{ fontSize: '18px', fontWeight: 700 }}>Edit Profile</h2>
        <div className="space-y-3 mb-4">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary text-sm outline-none focus:border-accent-primary"
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            placeholder="Username"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary text-sm outline-none focus:border-accent-primary"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio (optional)"
            rows={3}
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary text-sm outline-none resize-none focus:border-accent-primary"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="w-full py-3 rounded-2xl bg-accent-primary text-white font-semibold text-sm disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

const THEME_OPTIONS = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'Auto' },
];

export function ProfileScreen() {
  const navigate = useNavigate();
  const { profile, updateProfile, stats, unlockedBadges, bookmarks, groups, visits } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleRestartOnboarding = () => {
    try {
      localStorage.removeItem('hasCompletedOnboarding');
    } catch { /* ignore */ }
    window.dispatchEvent(new Event('reset-onboarding'));
  };

  const unlockedIds = new Set(unlockedBadges.map((b) => b.badgeId));
  const unlockedBadgeDefs = badgeDefinitions.filter((b) => unlockedIds.has(b.id));
  const recentVisits = [...visits]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Hero */}
      <div className="bg-surface border-b border-divider px-4 pt-14 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {profile.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-foreground leading-tight" style={{ fontSize: '20px', fontWeight: 700 }}>{profile.displayName}</h1>
            <p className="text-text-tertiary text-sm">@{profile.username}</p>
            {profile.bio && <p className="text-text-secondary text-xs mt-1 leading-snug">{profile.bio}</p>}
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="w-8 h-8 rounded-xl bg-surface-muted flex items-center justify-center flex-shrink-0"
          >
            <Edit2 className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Calendar className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-text-tertiary text-xs">
            Groundhopping since {format(new Date(profile.joinedAt), 'yyyy')}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Stats grid */}
        <div>
          <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />Statistics
          </p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Grounds visited"
              value={stats.totalGroundsVisited}
              icon={<MapPin className="w-4 h-4 text-accent-primary" />}
              color="bg-accent-primary/10"
            />
            <StatCard
              label="Bundesländer"
              value={stats.bundeslaenderCount}
              icon={<span className="text-sm">🗺️</span>}
              color="bg-info/10"
            />
            <StatCard
              label="Grounds w/ rail"
              value={stats.railGroundsCount}
              icon={<Train className="w-4 h-4 text-info" />}
              color="bg-info/10"
            />
            <StatCard
              label="Photos uploaded"
              value={stats.totalPhotos}
              icon={<Camera className="w-4 h-4 text-warning" />}
              color="bg-warning/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <StatCard
              label="Bookmarks"
              value={bookmarks.length}
              icon={<Bookmark className="w-4 h-4 text-warning" />}
              color="bg-warning/10"
            />
            <StatCard
              label="Group visits"
              value={stats.groupVisits}
              icon={<Users className="w-4 h-4 text-info" />}
              color="bg-info/10"
            />
          </div>
        </div>

        {/* Bookmarks link */}
        <button
          onClick={() => navigate('/profile/bookmarks')}
          className="w-full flex items-center justify-between bg-surface rounded-2xl p-4 border border-divider shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-warning" />
            </div>
            <div className="text-left">
              <p className="text-foreground font-semibold text-sm">My Bookmarks</p>
              <p className="text-text-tertiary text-xs">{bookmarks.length} ground{bookmarks.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-tertiary" />
        </button>

        {/* Badges link */}
        <button
          onClick={() => navigate('/profile/badges')}
          className="w-full flex items-center justify-between bg-surface rounded-2xl p-4 border border-divider shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center">
              <Award className="w-4 h-4 text-accent-primary" />
            </div>
            <div className="text-left">
              <p className="text-foreground font-semibold text-sm">Badges</p>
              <p className="text-text-tertiary text-xs">{unlockedBadges.length} / {badgeDefinitions.length} freigeschaltet</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unlockedBadgeDefs.slice(0, 3).map((b) => (
              <span key={b.id} className="text-lg">{b.icon}</span>
            ))}
            <ChevronRight className="w-4 h-4 text-text-tertiary" />
          </div>
        </button>

        {/* Groups overview */}
        <div>
          <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />Groups
          </p>
          {groups.length === 0 ? (
            <div className="bg-surface rounded-2xl p-4 border border-divider text-center">
              <p className="text-text-tertiary text-sm">No groups yet</p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-divider shadow-sm overflow-hidden">
              {groups.map((g, i) => (
                <div key={g.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-divider' : ''}`}>
                  <span className="text-xl">{g.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-sm truncate">{g.name}</p>
                    <p className="text-text-tertiary text-xs">{g.members.length} members</p>
                  </div>
                  <div className="flex -space-x-1.5">
                    {g.members.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center"
                        style={{ backgroundColor: m.avatarColor, fontSize: '8px', color: '#fff', fontWeight: 600 }}
                      >
                        {m.avatarInitials}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent visits */}
        {recentVisits.length > 0 && (
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold mb-3">Recent Visits</p>
            <div className="bg-surface rounded-2xl border border-divider shadow-sm overflow-hidden">
              {recentVisits.map((v, i) => {
                const g = resolveGround(v.groundId, v.groundData);
                return (
                  <div key={v.id} className={`px-4 py-3 ${i > 0 ? 'border-t border-divider' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-medium text-sm">{g?.name ?? 'Unknown Ground'}</p>
                        <p className="text-text-tertiary text-xs">
                          {g?.city || '—'} · {format(new Date(v.date), 'd MMM yyyy')}
                        </p>
                      </div>
                      {v.photos.length > 0 && (
                        <span className="flex items-center gap-1 text-text-tertiary text-xs">
                          <Camera className="w-3.5 h-3.5" />{v.photos.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── App settings ──────────────────────────────────────────────── */}
        <div className="pb-8">
          <p className="text-text-tertiary text-xs uppercase tracking-wider font-semibold mb-3">App</p>

          {/* Theme toggle */}
          <div className="bg-surface rounded-2xl p-4 border border-divider shadow-sm mb-3">
            <p className="text-foreground font-semibold text-sm mb-3">Erscheinungsbild</p>
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    theme === value
                      ? 'bg-accent-primary text-white'
                      : 'bg-surface-muted text-text-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRestartOnboarding}
            className="w-full flex items-center justify-between bg-surface rounded-2xl p-4 border border-divider shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-accent-primary" />
              </div>
              <div className="text-left">
                <p className="text-foreground font-semibold text-sm">Onboarding erneut ansehen</p>
                <p className="text-text-tertiary text-xs">App-Funktionen nochmal entdecken</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>
      </div>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onSave={updateProfile}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}