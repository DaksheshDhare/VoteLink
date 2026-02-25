import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as serviceWorkerRegistration from './services/serviceWorkerRegistration';
import { clearAllCaches, unregisterServiceWorkers } from './utils/clearCache';

console.log('🎯 main.tsx loading...');

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

// Clear old caches and service workers on startup to prevent stale UI
async function initializeApp() {
  try {
    console.log('🧹 Cleaning up old caches and service workers...');
    await clearAllCaches();
    await unregisterServiceWorkers();
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error);
    // Continue with app startup even if cleanup fails
  }

  if (!rootElement) {
    console.error('❌ Root element not found!');
  } else {
    try {
      createRoot(rootElement).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      console.log('✅ React app rendered successfully');
    } catch (error) {
      console.error('❌ Error rendering app:', error);
    }
  }

  // Register service worker AFTER app starts (with new cache name)
  serviceWorkerRegistration.register({
    onSuccess: () => console.log('✅ Service Worker registered - Offline support enabled'),
    onUpdate: () => console.log('🔄 New version available - Reload to update'),
    onOffline: () => console.log('📴 You are offline - Limited functionality'),
    onOnline: () => console.log('🌐 Connection restored')
  });
}

initializeApp();
