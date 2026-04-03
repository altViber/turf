import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from '../context/AppContext';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { motion, AnimatePresence } from 'motion/react';

function shouldShowOnboarding(): boolean {
  try {
    return localStorage.getItem('hasCompletedOnboarding') !== 'true';
  } catch {
    return false;
  }
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean>(shouldShowOnboarding);

  // Listen for the "reset-onboarding" event dispatched from ProfileScreen
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('hasCompletedOnboarding');
      setShowOnboarding(true);
    };
    window.addEventListener('reset-onboarding', handler);
    return () => window.removeEventListener('reset-onboarding', handler);
  }, []);

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('hasCompletedOnboarding', 'true');
      sessionStorage.setItem('fromOnboarding', 'true');
      // Force the URL to /map BEFORE RouterProvider mounts so it never
      // restores a stale route like /profile from a previous session.
      window.history.replaceState(null, '', '/welcome');
    } catch {
      /* ignore storage errors */
    }
    setShowOnboarding(false);
  };

  return (
    <AnimatePresence mode="wait">
      {showOnboarding ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{ position: 'fixed', inset: 0, zIndex: 50 }}
        >
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{ height: '100%' }}
        >
          <AppProvider>
            <RouterProvider router={router} />
          </AppProvider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}