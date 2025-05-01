
import { useEffect } from "react";
import { registerPlugin } from "@capacitor/core";

// Create a custom interface for our call state plugin
interface CallStatePlugin {
  addListener: (eventName: string, callback: (data: { state: string }) => void) => void;
  removeAllListeners: () => void;
}

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
          // Try to register the plugin dynamically
          const CallState = registerPlugin<CallStatePlugin>('CallState');
          
          if (CallState) {
            CallState.addListener('callStateChanged', ({ state }) => {
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
            const CallState = registerPlugin<CallStatePlugin>('CallState');
            if (CallState) {
              CallState.removeAllListeners();
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
