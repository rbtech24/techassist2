import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

let deferredPrompt: any = null;

export default function PWAPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      deferredPrompt = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    deferredPrompt = null;
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 safe-area-inset-bottom z-50 animate-fade-in">
      <div className="flex items-start gap-3 relative">
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-shrink-0">
          <Download className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Install SPARKY</h3>
          <p className="text-sm text-gray-600 mt-1">
            Install SPARKY on your device for quick access to expert appliance repair assistance.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleInstallClick}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}