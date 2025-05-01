
import { useEffect } from "react";

export const usePhoneCallHandling = (
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void
) => {
  // Handle phone call interruptions
  useEffect(() => {
    const handleCallStateChanged = (state: string) => {
      if (state === "RINGING" || state === "OFFHOOK") {
        if (isPlaying) {
          setIsPlaying(false);
        }
      }
    };

    // Try to use Capacitor plugin if available
    try {
      // This is a placeholder for potential Capacitor implementation
      // We'll use a more generic approach to avoid TypeScript errors
      const setupCallListener = async () => {
        try {
          // Safely check for the Capacitor environment
          const capacitor = await import('@capacitor/core');
          
          // Check if there's a plugin related to call state
          if (capacitor && capacitor.Plugins && 'CallState' in capacitor.Plugins) {
            // @ts-ignore - Using dynamic access to avoid TypeScript errors
            const CallStatePlugin = capacitor.Plugins.CallState;
            CallStatePlugin.addListener('callStateChanged', ({ state }: { state: string }) => {
              handleCallStateChanged(state);
            });
          }
        } catch (err) {
          console.log('CallState plugin not available:', err);
        }
      };

      setupCallListener();
      
      return () => {
        // Clean up listeners if needed
        try {
          const cleanup = async () => {
            const capacitor = await import('@capacitor/core');
            if (capacitor && capacitor.Plugins && 'CallState' in capacitor.Plugins) {
              // @ts-ignore - Using dynamic access to avoid TypeScript errors
              const CallStatePlugin = capacitor.Plugins.CallState;
              CallStatePlugin.removeAllListeners();
            }
          };
          cleanup();
        } catch (err) {
          // Ignore cleanup errors
        }
      };
    } catch (err) {
      // No Capacitor environment, no need for phone call handling
      console.log('Not in a Capacitor environment, phone call handling disabled');
    }
  }, [isPlaying, setIsPlaying]);
};
