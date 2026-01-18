# MovieFlix PWA Setup Guide

## Overview

This document outlines the complete Progressive Web App (PWA) implementation for MovieFlix. The app now supports offline browsing, installation on devices, background sync, and push notifications.

## Features Implemented

### 1. **Service Worker**
- **Location**: `/public/sw.js`
- **Features**:
  - Offline support with intelligent caching strategies
  - Network-first caching for API and HTML requests
  - Cache-first strategy for assets (images, CSS, JS)
  - Background sync for watchlist changes
  - Push notification handling
  - Cache management and cleanup

### 2. **Web App Manifest**
- **Location**: `/public/manifest.json`
- **Includes**:
  - App metadata (name, description, theme colors)
  - App icons using `/favicon.jpg`
  - App shortcuts (Home, Movies, TV Shows, My List)
  - Screenshots for app store listings

### 3. **Install Support**
- **Install Prompt Component**: `src/components/common/PWAInstallPrompt.jsx`
- Users can install the app on:
  - Android devices
  - iPhones (iOS 16.4+)
  - Windows (using Microsoft Store integration)
  - macOS (Safari support)

### 4. **Update Management**
- **Update Prompt Component**: `src/components/common/PWAUpdatePrompt.jsx`
- Detects new app versions
- Shows update notification
- Auto-reloads on update acceptance

### 5. **PWA Hooks & Utilities**
- **usePWA Hook**: `src/hooks/usePWA.js`
  - Manages install prompts
  - Tracks online/offline status
  - Provides cache management
  - Handles service worker updates

- **PWA Configuration**: `src/utils/pwaConfig.js`
  - Feature detection
  - Cache settings
  - Offline strategy configuration
  - Capability matrix for different app sections

## Setup & Configuration

### Prerequisites
1. Node.js 16+ installed
2. Favicon image at `/public/favicon.jpg` (required)
3. HTTPS enabled in production (PWA requires secure context)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the App**
   ```bash
   npm run build
   ```

3. **Deploy to HTTPS**
   PWA features require HTTPS in production. Ensure your hosting supports it.

## Usage

### Using the Install Prompt Component
```jsx
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

function App() {
  return (
    <>
      <PWAInstallPrompt />
      {/* Rest of your app */}
    </>
  );
}
```

### Using the Update Prompt Component
```jsx
import PWAUpdatePrompt from './components/common/PWAUpdatePrompt';

function App() {
  return (
    <>
      <PWAUpdatePrompt />
      {/* Rest of your app */}
    </>
  );
}
```

### Using the usePWA Hook
```jsx
import { usePWA } from './hooks/usePWA';

function MyComponent() {
  const { 
    isOnline, 
    isInstalled, 
    installApp, 
    clearCache,
    updateApp 
  } = usePWA();

  return (
    <>
      <p>Online: {isOnline ? '✓' : '✗'}</p>
      <button onClick={installApp}>Install App</button>
      <button onClick={clearCache}>Clear Cache</button>
      <button onClick={updateApp}>Update App</button>
    </>
  );
}
```

### Checking PWA Features
```jsx
import { getAvailableFeatures, getPWAStatus } from './utils/pwaConfig';

// Get all available features
const features = getAvailableFeatures();
console.log(features.serviceWorker); // true/false
console.log(features.pushNotifications); // true/false

// Get overall PWA status
const status = getPWAStatus();
console.log(status.isOnline);
console.log(status.isInstalled);
console.log(status.isFullyCapable);
```

## Caching Strategies

### Network-First (Default for API & HTML)
- Tries network first
- Falls back to cache if offline
- Updates cache with network response
- Best for frequently updated content

### Cache-First (Assets)
- Checks cache first
- Falls back to network if not cached
- Best for static assets that rarely change

## Offline Support

The app supports offline browsing for:
- ✓ Previously browsed movie/TV show content
- ✓ Cached images and metadata
- ✓ Navigation and UI
- ✗ Video streaming (requires internet)
- ✗ Real-time API calls

## Push Notifications

When enabled, users can receive notifications about:
- New content releases
- Watchlist updates
- App updates available

To send notifications:
```javascript
// Server-side example
const subscription = userSubscription; // From user's SW
await sendNotification(subscription, {
  title: 'MovieFlix',
  body: 'New movie added to your favorites!'
});
```

## Background Sync

The service worker can sync pending watchlist changes when the app goes back online:
- Pending watchlist additions
- User preference updates
- Favorite toggles

To trigger sync:
```javascript
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('sync-watchlist');
  });
}
```

## File Structure

```
MovieFlix PWA Files:
├── public/
│   ├── favicon.jpg          (Required: App icon)
│   ├── manifest.json        (PWA manifest)
│   └── sw.js               (Service worker)
├── src/
│   ├── main.jsx            (SW registration)
│   ├── hooks/
│   │   └── usePWA.js       (PWA hook)
│   ├── utils/
│   │   └── pwaConfig.js    (PWA config & features)
│   └── components/common/
│       ├── PWAInstallPrompt.jsx    (Install UI)
│       └── PWAUpdatePrompt.jsx     (Update UI)
├── vite.config.js          (Vite PWA plugin config)
├── index.html              (PWA meta tags)
└── package.json            (Dependencies)
```

## Browser Support

### Service Workers & Offline
- ✓ Chrome 40+
- ✓ Firefox 44+
- ✓ Safari 11.1+
- ✓ Edge 17+
- ✓ Opera 27+

### Install Prompt
- ✓ Android (Chrome, Firefox, Samsung Internet)
- ✓ iOS 16.4+ (Safari)
- ✓ Windows 10+ (Chrome, Edge)
- ✓ macOS (Safari)

### Push Notifications
- ✓ Chrome 50+
- ✓ Firefox 48+
- ✓ Edge 17+
- ✗ Safari (limited support)

## Debugging

### Check Service Worker Status
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW Registrations:', registrations);
});
```

### Inspect Cache
```javascript
caches.keys().then(names => {
  console.log('Available caches:', names);
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(`Cache ${name}:`, requests);
      });
    });
  });
});
```

### Clear All Caches
```javascript
caches.keys().then(names => {
  Promise.all(names.map(name => caches.delete(name)));
});
```

### View in DevTools
1. Open Chrome/Edge DevTools
2. Go to **Application** tab
3. Check:
   - **Manifest**: PWA configuration
   - **Service Workers**: Active SW status
   - **Cache Storage**: Cached resources
   - **Storage**: IndexedDB, LocalStorage

## Deployment Checklist

- [ ] HTTPS enabled
- [ ] favicon.jpg added to `/public/`
- [ ] manifest.json configured
- [ ] Service worker registered in main.jsx
- [ ] PWA components added to App.jsx
- [ ] Build successful: `npm run build`
- [ ] Test on real device (not just DevTools)
- [ ] Test offline functionality
- [ ] Test install prompt
- [ ] Check PWA lighthouse score

## Performance Tips

1. **Optimize Icons**: Keep favicon.jpg under 100KB
2. **Cache Wisely**: Don't cache too much to avoid disk space issues
3. **Update Strategy**: Use auto-update for critical fixes
4. **Network First for APIs**: Better UX with stale-while-revalidate pattern
5. **Monitor Cache**: Implement cleanup strategies for old caches

## Troubleshooting

### Service Worker won't register
- Check HTTPS is enabled
- Verify `/public/sw.js` exists
- Check browser console for errors

### Install prompt not showing
- Only shows after 2+ visits or specific engagement
- Must be installable (manifests, HTTPS)
- Chrome DevTools can force show via `beforeinstallprompt` event

### Cache not updating
- Clear browser cache and storage
- Bump cache version in sw.js
- Use Network tab to bypass cache during testing

### Notifications not working
- User must have granted permission
- Check browser notification settings
- Verify push notification is properly sent

## Security Considerations

1. **HTTPS Only**: PWA requires secure context
2. **Service Worker Scope**: Properly scoped to `/movieflix/`
3. **Cache Validation**: Check response status before caching
4. **Sensitive Data**: Don't cache auth tokens or personal info
5. **Content Security Policy**: Use CSP headers to prevent attacks

## References

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web Dev: PWA Guide](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://www.w3.org/TR/appmanifest/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## Support

For issues or questions about the PWA implementation, refer to:
1. Browser DevTools > Application tab
2. Console logs from service worker
3. [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
