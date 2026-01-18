import { useEffect, useState } from 'react';
import { MdCloudOff, MdCloudDone } from 'react-icons/md';

/**
 * OfflineIndicator Component
 * Shows offline status and provides cache management
 */
export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Calculate cache size
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage }) => {
        setCacheSize((usage / 1024 / 1024).toFixed(2)); // MB
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-amber-500 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <MdCloudDone size={20} />
          <span className="text-sm font-medium">Back Online</span>
        </>
      ) : (
        <>
          <MdCloudOff size={20} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Offline Mode</span>
            {cacheSize > 0 && (
              <span className="text-xs opacity-90">{cacheSize} MB cached</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
