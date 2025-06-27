
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('InstallPrompt: Component mounted, checking PWA status...');
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isInWebAppiOS;
      
      console.log('InstallPrompt: PWA installation check:', {
        isStandalone,
        isInWebAppiOS,
        isInstalled,
        userAgent: navigator.userAgent
      });
      
      setIsInstalled(isInstalled);
      return isInstalled;
    };

    const installed = checkIfInstalled();
    
    if (installed) {
      console.log('InstallPrompt: App is already installed');
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('InstallPrompt: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed the prompt in this session
      const dismissed = sessionStorage.getItem('installPromptDismissed');
      if (!dismissed) {
        setShowInstallPrompt(true);
        console.log('InstallPrompt: Showing install prompt');
      } else {
        console.log('InstallPrompt: Prompt was dismissed in this session');
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('InstallPrompt: App was installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      sessionStorage.removeItem('installPromptDismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('InstallPrompt: Service worker is ready');
      });
    }

    // Debug: Log manifest status
    if ('getRegistrations' in navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('InstallPrompt: Service worker registrations:', registrations.length);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('InstallPrompt: No deferred prompt available');
      return;
    }

    try {
      console.log('InstallPrompt: Triggering install prompt...');
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('InstallPrompt: User choice:', outcome);
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      
      if (outcome === 'dismissed') {
        sessionStorage.setItem('installPromptDismissed', 'true');
      }
    } catch (error) {
      console.error('InstallPrompt: Error during install:', error);
    }
  };

  const handleDismiss = () => {
    console.log('InstallPrompt: User dismissed install prompt');
    setShowInstallPrompt(false);
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">Install Uradio</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Install the app for a better experience and offline access
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-1" />
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Not now
            </Button>
          </div>
        </div>
        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
