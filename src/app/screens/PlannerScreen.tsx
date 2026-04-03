import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Users, CalendarDays, ChevronRight, Loader2 } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { grounds as staticGrounds } from '../../data/grounds';
import type { GroupEvent } from '../../types';

function resolveGroundName(ev: GroupEvent): { name: string; city: string } {
  const g = ev.groundData ?? staticGrounds.find((sg) => sg.id === ev.groundId);
  return { name: g?.name ?? 'Unknown ground', city: g?.city ?? '' };
}

function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGroup } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('⚽');
  const [saving, setSaving] = useState(false);
  const emojis = ['⚽', '🥅', '🏟️', '🚆', '🏆', '🎯', '🗺️', '📸'];

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        emoji,
        color: '#16a34a',
        members: [{ id: 'm1', name: 'Max Müller', avatarInitials: 'MM', avatarColor: '#16a34a', role: 'admin' }],
      });
      setName(''); setDescription(''); setEmoji('⚽');
      onClose();
    } catch (e) {
      console.error('Failed to create group:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-surface rounded-t-3xl px-5 pb-10 pt-5">
        <h2 className="text-foreground mb-4" style={{ fontSize: '18px', fontWeight: 700 }}>New Group</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${
                emoji === e ? 'border-accent-primary bg-accent-primary/10' : 'border-transparent bg-surface-muted'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Group name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary text-sm outline-none focus:border-accent-primary mb-3"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-text-secondary text-sm outline-none focus:border-accent-primary mb-4"
        />
        <button
          onClick={handleCreate}
          disabled={!name.trim() || saving}
          className="w-full py-3 rounded-2xl bg-accent-primary text-white font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Creating…' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}

export function PlannerScreen() {
  const navigate = useNavigate();
  const { groups, events } = useApp();
  const [createOpen, setCreateOpen] = useState(false);

  const getNextEvent = (groupId: string) => {
    const now = new Date();
    return events
      .filter((e) => e.groupId === groupId && isAfter(new Date(e.startDateTime), now))
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())[0];
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-divider px-4 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground" style={{ fontSize: '22px', fontWeight: 700 }}>Planner</h1>
            <p className="text-text-tertiary text-sm">Group-based event planning</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent-primary text-white rounded-xl text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Group
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {groups.length === 0 && (
          <div className="text-center py-16 text-text-tertiary">
            <Users className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm">No groups yet. Create one to start planning.</p>
          </div>
        )}
        {groups.map((group) => {
          const nextEvent = getNextEvent(group.id);
          const memberCount = group.members.length;
          const groundInfo = nextEvent ? resolveGroundName(nextEvent) : null;

          return (
            <button
              key={group.id}
              onClick={() => navigate(`/planner/groups/${group.id}`)}
              className="w-full bg-surface rounded-2xl p-4 text-left shadow-sm border border-divider active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${group.color}18` }}
                >
                  {group.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground font-semibold text-base truncate">{group.name}</span>
                    <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                  </div>
                  {group.description && (
                    <p className="text-text-tertiary text-xs truncate mt-0.5">{group.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-text-tertiary text-xs">
                      <Users className="w-3.5 h-3.5" />
                      {memberCount}
                    </div>
                    {nextEvent && groundInfo ? (
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${group.color}14`, color: group.color }}
                      >
                        <CalendarDays className="w-3 h-3" />
                        {format(new Date(nextEvent.startDateTime), 'EEE d MMM')} · {groundInfo.city || groundInfo.name}
                      </div>
                    ) : (
                      <span className="text-text-tertiary text-xs">No upcoming events</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Members */}
              <div className="flex -space-x-1.5 mt-3">
                {group.members.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: m.avatarColor, fontSize: '9px', color: 'white', fontWeight: 600 }}
                  >
                    {m.avatarInitials}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
