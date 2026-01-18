import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';

/**
 * PWAUpdatePrompt Component
 * Shows update notification when new version is available
 */
export const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration);

        // Check for updates periodically
        const interval = setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Listen for waiting service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowPrompt(true);
            }
          });
        });

        return () => clearInterval(interval);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowPrompt(false);
      
      // Reload after service worker activates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-purple-600 text-white rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slide-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Update Available</h3>
          <p className="text-sm text-purple-100">
            A new version of MovieFlix is available. Update now to get the latest features and improvements.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-purple-200 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <AiOutlineClose size={20} />
        </button>
      </div>
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-white text-purple-600 font-medium py-2 rounded hover:bg-gray-100 transition-colors text-sm"
        >
          Update Now
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-purple-700 text-white font-medium py-2 rounded hover:bg-purple-800 transition-colors text-sm"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
