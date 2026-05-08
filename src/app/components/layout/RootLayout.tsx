import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-none bg-background">
        <Outlet />
      </main>
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
