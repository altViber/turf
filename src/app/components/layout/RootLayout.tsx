import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <>
      <div className="fixed inset-0 flex flex-col overflow-hidden bg-surface-elevated" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="flex-1 overflow-hidden relative bg-background">
          <Outlet />
        </div>
        <BottomNav />
      </div>
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
    </>
  );
}
