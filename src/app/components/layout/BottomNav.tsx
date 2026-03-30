import { useLocation, useNavigate } from 'react-router';
import { Map, CalendarDays, Award, User } from 'lucide-react';

const TABS = [
  { path: '/map', label: 'Map', icon: Map },
  { path: '/planner', label: 'Planner', icon: CalendarDays },
  { path: '/badges', label: 'Badges', icon: Award },
  { path: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    if (path === '/map') return pathname === '/map' || pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-t border-gray-100 flex-shrink-0" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                active ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
              <span className="text-xs" style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-green-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
