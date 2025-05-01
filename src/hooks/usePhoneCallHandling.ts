
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
      // Actual implementation would depend on the specific Capacitor plugin
      const setupCallListener = async () => {
        try {
          const { CallState } = await import('@capacitor/core');
          CallState.addListener('callStateChanged', ({ state }) => {
            handleCallStateChanged(state);
          });
        } catch (err) {
          console.log('CallState plugin not available:', err);
        }
      };

      setupCallListener();
      
      return () => {
        // Clean up listeners if needed
        try {
          const cleanup = async () => {
            const { CallState } = await import('@capacitor/core');
            CallState.removeAllListeners();
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
