/**
 * Cache Clearing Utilities
 * Run these functions in the browser console or on app startup to clear stale caches
 */

export async function clearAllCaches() {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('[Cache] Found caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`[Cache] Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
      console.log('✅ [Cache] All caches cleared successfully');
      return true;
    } else {
      console.warn('❌ [Cache] Caches API not available');
      return false;
    }
  } catch (error) {
    console.error('❌ [Cache] Error clearing caches:', error);
    return false;
  }
}

export async function unregisterServiceWorkers() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('[ServiceWorker] Found registrations:', registrations.length);
      
      await Promise.all(
        registrations.map(registration => {
          console.log('[ServiceWorker] Unregistering:', registration);
          return registration.unregister();
        })
      );
      console.log('✅ [ServiceWorker] All service workers unregistered');
      return true;
    } else {
      console.warn('❌ [ServiceWorker] Service Worker API not available');
      return false;
    }
  } catch (error) {
    console.error('❌ [ServiceWorker] Error unregistering:', error);
    return false;
  }
}

export async function clearBrowserStorage() {
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✅ [Storage] localStorage cleared');

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('✅ [Storage] sessionStorage cleared');

    // Clear IndexedDB
    if ('indexedDB' in window) {
      const databases = await window.indexedDB.databases?.() || [];
      for (const db of databases) {
        window.indexedDB.deleteDatabase(db.name);
        console.log(`✅ [Storage] Deleted IndexedDB: ${db.name}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ [Storage] Error clearing storage:', error);
    return false;
  }
}

export async function hardRefresh() {
  try {
    console.log('🔄 [Cache] Performing hard refresh...');
    
    // Clear all caches
    await clearAllCaches();
    
    // Unregister service workers
    await unregisterServiceWorkers();
    
    // Clear storage
    await clearBrowserStorage();
    
    console.log('✅ [Cache] All caches cleared. Reloading page...');
    
    // Hard refresh the page (Ctrl+Shift+R equivalent)
    window.location.href = window.location.href;
  } catch (error) {
    console.error('❌ [Cache] Hard refresh failed:', error);
  }
}

// Make available in window for console access
declare global {
  interface Window {
    clearCache: {
      clearAll: () => Promise<boolean>;
      unregisterSW: () => Promise<boolean>;
      clearStorage: () => Promise<boolean>;
      hardRefresh: () => Promise<void>;
    };
  }
}

if (typeof window !== 'undefined') {
  (window as any).clearCache = {
    clearAll: clearAllCaches,
    unregisterSW: unregisterServiceWorkers,
    clearStorage: clearBrowserStorage,
    hardRefresh: hardRefresh
  };
}
