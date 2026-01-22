'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Unregister any existing service workers first to avoid conflicts
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });

      // Register new service worker
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates periodically
          const updateInterval = setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available, prompt user to refresh
                  if (
                    confirm(
                      'A new version of InternHub is available! Reload to update?'
                    )
                  ) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Cleanup interval on unmount
          return () => clearInterval(updateInterval);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          // Silently fail - app will work without service worker
        });

      // Handle controller change (new service worker activated)
      const handleControllerChange = () => {
        window.location.reload();
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return null;
}

// Utility function to check if app is installed
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Utility function to prompt PWA install
export function usePWAInstall() {
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show custom install prompt after a delay
      setTimeout(() => {
        if (!isAppInstalled() && !localStorage.getItem('pwa-dismissed')) {
          const shouldInstall = confirm(
            'Install InternHub for quick access and offline support?'
          );
          if (shouldInstall && deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'dismissed') {
                localStorage.setItem('pwa-dismissed', 'true');
              }
              deferredPrompt = null;
            });
          } else {
            localStorage.setItem('pwa-dismissed', 'true');
          }
        }
      }, 3000); // Wait 3 seconds before prompting
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
}
