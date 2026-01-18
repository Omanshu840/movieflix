import { useEffect, useState, useCallback } from 'react';

/**
 * usePWA Hook
 * Provides PWA features like install prompts, offline status, and cache management
 */
export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    // Handle install prompt
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    // Check if app is installed
    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    // Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get SW registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          setSwRegistration(registration);
        })
        .catch((error) => {
          console.log('[PWA] SW registration error:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log('[PWA] User response to install prompt:', outcome);
    setInstallPrompt(null);
  }, [installPrompt]);

  const clearCache = useCallback(async () => {
    if (swRegistration && swRegistration.active) {
      swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }, [swRegistration]);

  const updateApp = useCallback(async () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [swRegistration]);

  return {
    installPrompt,
    isInstalled,
    isOnline,
    swRegistration,
    installApp,
    clearCache,
    updateApp
  };
};

export default usePWA;
