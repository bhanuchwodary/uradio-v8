
import { useEffect, useRef } from "react";

export const usePhoneCallHandling = (
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void
) => {
  const wasPlayingRef = useRef(false);
  const interruptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Enhanced phone call interruption handling for mobile browsers
    
    // 1. Page Visibility API - handles most interruptions including phone calls
    const handleVisibilityChange = () => {
      console.log("Visibility change detected:", document.hidden, "isPlaying:", isPlaying);
      
      if (document.hidden) {
        // Page is hidden (phone call, app switch, etc.)
        if (isPlaying) {
          wasPlayingRef.current = true;
          setIsPlaying(false);
          console.log("Audio paused due to page becoming hidden (possible phone call)");
        }
      } else {
        // Page is visible again
        if (wasPlayingRef.current) {
          // Add a longer delay for phone call scenarios
          interruptionTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to resume playback after page became visible");
            setIsPlaying(true);
            wasPlayingRef.current = false;
          }, 1000); // Increased delay for better stability
        }
      }
    };

    // 2. Enhanced Audio Context State Monitoring
    const setupAudioContextMonitoring = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const handleAudioContextStateChange = () => {
          console.log("Audio context state changed:", audioContext.state, "isPlaying:", isPlaying);
          
          if (audioContext.state === 'interrupted' || audioContext.state === 'suspended') {
            if (isPlaying) {
              wasPlayingRef.current = true;
              setIsPlaying(false);
              console.log("Audio paused due to audio context interruption (phone call detected)");
            }
          } else if (audioContext.state === 'running' && wasPlayingRef.current) {
            // Clear any existing timeout and set a new one
            if (interruptionTimeoutRef.current) {
              clearTimeout(interruptionTimeoutRef.current);
            }
            
            interruptionTimeoutRef.current = setTimeout(() => {
              console.log("Audio resumed after audio context state became running");
              setIsPlaying(true);
              wasPlayingRef.current = false;
            }, 1500); // Longer delay for audio context recovery
          }
        };

        audioContext.addEventListener('statechange', handleAudioContextStateChange);
        
        return () => {
          audioContext.removeEventListener('statechange', handleAudioContextStateChange);
          audioContext.close().catch(console.warn);
        };
      } catch (error) {
        console.log("Audio context not available for interruption handling:", error);
        return () => {};
      }
    };

    // 3. Enhanced Media Session API Integration
    const setupMediaSessionInterruption = () => {
      if ('mediaSession' in navigator) {
        // Handle interruption through media session
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log("Media session pause action (external interruption like phone call)");
          wasPlayingRef.current = true;
          setIsPlaying(false);
        });

        navigator.mediaSession.setActionHandler('play', () => {
          console.log("Media session play action (resuming after interruption)");
          if (wasPlayingRef.current) {
            setIsPlaying(true);
            wasPlayingRef.current = false;
          }
        });

        // Handle seek events which can indicate audio focus changes
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          console.log("Media session seek action (possible audio focus change)");
          // This can indicate the system is trying to manage audio focus
        });
      }
    };

    // 4. Window Focus/Blur Events (backup method)
    const handleWindowBlur = () => {
      console.log("Window blur detected, isPlaying:", isPlaying);
      if (isPlaying) {
        wasPlayingRef.current = true;
        setIsPlaying(false);
        console.log("Audio paused due to window blur (app backgrounded for call)");
      }
    };

    const handleWindowFocus = () => {
      console.log("Window focus detected, wasPlaying:", wasPlayingRef.current);
      if (wasPlayingRef.current) {
        // Clear existing timeout and set new one
        if (interruptionTimeoutRef.current) {
          clearTimeout(interruptionTimeoutRef.current);
        }
        
        interruptionTimeoutRef.current = setTimeout(() => {
          console.log("Audio resumed after window regained focus");
          setIsPlaying(true);
          wasPlayingRef.current = false;
        }, 800);
      }
    };

    // 5. Before Unload Event (for app switching during calls)
    const handleBeforeUnload = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        console.log("Before unload - marking as was playing for potential resume");
      }
    };

    // 6. Page Show/Hide Events (iOS Safari specific)
    const handlePageHide = () => {
      console.log("Page hide event (iOS Safari specific)");
      if (isPlaying) {
        wasPlayingRef.current = true;
        setIsPlaying(false);
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      console.log("Page show event (iOS Safari specific), persisted:", event.persisted);
      if (wasPlayingRef.current) {
        // Clear existing timeout
        if (interruptionTimeoutRef.current) {
          clearTimeout(interruptionTimeoutRef.current);
        }
        
        interruptionTimeoutRef.current = setTimeout(() => {
          setIsPlaying(true);
          wasPlayingRef.current = false;
        }, 1200);
      }
    };

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow as EventListener);
    
    const audioContextCleanup = setupAudioContextMonitoring();
    setupMediaSessionInterruption();

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow as EventListener);
      
      if (interruptionTimeoutRef.current) {
        clearTimeout(interruptionTimeoutRef.current);
      }
      
      audioContextCleanup();
    };
  }, [isPlaying, setIsPlaying]);

  // Reset the ref when playback state changes externally
  useEffect(() => {
    if (isPlaying) {
      wasPlayingRef.current = false;
      // Clear any pending resume timeouts when playback starts
      if (interruptionTimeoutRef.current) {
        clearTimeout(interruptionTimeoutRef.current);
        interruptionTimeoutRef.current = null;
      }
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (interruptionTimeoutRef.current) {
        clearTimeout(interruptionTimeoutRef.current);
      }
    };
  }, []);
};
