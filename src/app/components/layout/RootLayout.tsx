import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 600,
            padding: '12px 16px',
          },
        }}
      />
    </div>
  );
}
