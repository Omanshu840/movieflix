/**
 * PWA Configuration
 * Advanced PWA settings and feature detection
 */

export const PWA_CONFIG = {
  // App Information
  app: {
    name: 'MovieFlix',
    shortName: 'MovieFlix',
    description: 'Discover and stream your favorite movies and TV shows',
    version: '1.0.0'
  },

  // Colors
  colors: {
    primary: '#7C3AED',
    background: '#0F172A',
    statusBar: 'black-translucent'
  },

  // Cache Configuration
  cache: {
    version: 'v1',
    static: 'movieflix-static-v1',
    dynamic: 'movieflix-dynamic-v1',
    api: 'movieflix-api-v1',
    maxSize: 50 * 1024 * 1024, // 50MB
    ttl: {
      static: 30 * 24 * 60 * 60 * 1000, // 30 days
      dynamic: 7 * 24 * 60 * 60 * 1000, // 7 days
      api: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Push Notifications
  notifications: {
    enabled: true,
    defaultTag: 'movieflix-notification',
    badge: '/favicon.jpg',
    icon: '/favicon.jpg'
  },

  // Background Sync
  backgroundSync: {
    enabled: true,
    tags: ['sync-watchlist', 'sync-favorites']
  },

  // Offline Support
  offline: {
    enabled: true,
    strategy: 'network-first', // or 'cache-first'
    showOfflineIndicator: true
  },

  // Periodic Sync (if supported)
  periodicSync: {
    enabled: true,
    minInterval: 24 * 60 * 60 * 1000, // 24 hours
    tags: ['update-content', 'cleanup-cache']
  }
};

/**
 * Feature Detection
 */
export const PWA_FEATURES = {
  serviceWorker: () => 'serviceWorker' in navigator,
  cacheAPI: () => 'caches' in window,
  indexedDB: () => 'indexedDB' in window,
  pushNotifications: () => 'Notification' in window && 'serviceWorker' in navigator,
  backgroundSync: () => 'serviceWorker' in navigator && 'SyncManager' in window,
  periodicSync: () => 'serviceWorker' in navigator && 'PeriodicSyncManager' in window,
  webWorkers: () => typeof Worker !== 'undefined',
  offline: () => 'onLine' in navigator,
  install: () => 'beforeinstallprompt' in window,
  shareAPI: () => 'share' in navigator,
  clipboard: () => navigator.clipboard !== undefined,
  vibration: () => 'vibrate' in navigator,
  geolocation: () => 'geolocation' in navigator,
  camera: () => 'mediaDevices' in navigator
};

/**
 * Get available PWA features
 */
export const getAvailableFeatures = () => {
  return Object.entries(PWA_FEATURES).reduce((acc, [key, checkFn]) => {
    acc[key] = checkFn();
    return acc;
  }, {});
};

/**
 * Get PWA status
 */
export const getPWAStatus = () => {
  const features = getAvailableFeatures();
  const isOnline = navigator.onLine;
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
  const isInApp = window.navigator.standalone === true;

  return {
    features,
    isOnline,
    isInstalled,
    isInApp,
    isFullyCapable: features.serviceWorker && features.cacheAPI
  };
};

/**
 * Capabilities for different app sections
 */
export const CAPABILITY_MATRIX = {
  streaming: {
    online: true,
    offline: false, // Videos won't work offline
    requiresAuth: true
  },
  browsing: {
    online: true,
    offline: true, // Can browse cached content
    requiresAuth: false
  },
  watchlist: {
    online: true,
    offline: true, // Local watchlist works offline
    requiresAuth: true
  },
  search: {
    online: true,
    offline: true, // Can search cached data
    requiresAuth: false
  },
  settings: {
    online: true,
    offline: true, // Settings work offline
    requiresAuth: true
  }
};

export default PWA_CONFIG;
