import { useLocation, useNavigate } from 'react-router';
import { Map, CalendarDays, User } from 'lucide-react';

const TABS = [
  { path: '/map', label: 'Karte', icon: Map },
  { path: '/planner', label: 'Planer', icon: CalendarDays },
  { path: '/profile', label: 'Profil', icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === '/map') return pathname === '/map' || pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="shrink-0 bg-surface-elevated border-t border-divider safe-area-bottom">
      <div className="flex">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 transition-colors ${
                active ? 'text-accent-primary' : 'text-text-tertiary'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className="text-xs" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-accent-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
