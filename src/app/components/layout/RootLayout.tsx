import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { BottomNav } from './BottomNav';

export function RootLayout() {
  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-surface-elevated" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex-1 overflow-hidden relative bg-background" style={{ paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
        <Outlet />
      </div>
      <BottomNav />
      <Toaster
        position="top-center"
        containerStyle={{ position: 'fixed' }}
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
