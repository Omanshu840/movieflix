import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { MdFileDownload } from 'react-icons/md';

/**
 * PWAInstallPrompt Component
 * Shows install prompt when app can be installed
 */
export const PWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Hide after 10 seconds
    const timer = setTimeout(() => {
      setShowPrompt(false);
    }, 10000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled || !installPrompt) return null;

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-xl p-4 z-50 animate-slide-down">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1 text-white">
            <MdFileDownload size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install MovieFlix</h3>
            <p className="text-sm text-purple-100">
              Install MovieFlix on your device for quick access and offline browsing.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-purple-200 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <AiOutlineClose size={20} />
        </button>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleInstall}
          className="flex-1 bg-white text-purple-600 font-semibold py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-purple-800 text-white font-semibold py-2.5 rounded-lg hover:bg-purple-900 transition-colors"
        >
          Not Now
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
