// Service Worker Registration
// This file handles the registration and lifecycle of the service worker

interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

      if (isLocalhost) {
        // Check if a service worker exists
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker. ' +
            'To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Register service worker
        registerValidSW(swUrl, config);
      }
    });

    // Online/Offline event listeners
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      if (config?.onOnline) {
        config.onOnline();
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      if (config?.onOffline) {
        config.onOffline();
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'New content is available; please refresh. ' +
                'See https://cra.link/PWA.'
              );

              if (config?.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');

              if (config?.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service Worker unregistered');
      })
      .catch((error) => {
        console.error('Error unregistering service worker:', error);
      });
  }
}

// Helper function to cache specific URLs on demand
export function cacheUrls(urls: string[]): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!('serviceWorker' in navigator)) {
      reject(new Error('Service Worker not supported'));
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve(true);
          } else {
            reject(new Error(event.data.error));
          }
        };

        registration.active.postMessage(
          {
            type: 'CACHE_URLS',
            payload: urls,
          },
          [messageChannel.port2]
        );
      } else {
        reject(new Error('Service Worker not active'));
      }
    });
  });
}

// Check if app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

// Get network status
export function getNetworkStatus(): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
} {
  const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
  };
}
