import { useLocation, useNavigate } from 'react-router';
import { Home, Map, CalendarDays, Award, User } from 'lucide-react';

const TABS = [
  { path: '/welcome', label: 'Home', icon: Home },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/planner', label: 'Planner', icon: CalendarDays },
  { path: '/badges', label: 'Badges', icon: Award },
  { path: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === '/welcome') return pathname === '/welcome' || pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-surface-elevated border-t border-divider flex-shrink-0">
      <div className="flex">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                active ? 'text-accent-primary' : 'text-text-tertiary'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className="text-xs" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-accent-primary mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
