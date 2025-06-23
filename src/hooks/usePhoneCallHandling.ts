
import { useEffect, useRef } from "react";

export const usePhoneCallHandling = (
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void
) => {
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    // Handle phone call interruptions using Web Audio API and visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (could be due to phone call or other interruption)
        if (isPlaying) {
          wasPlayingRef.current = true;
          setIsPlaying(false);
          console.log("Audio paused due to page visibility change (possible phone call)");
        }
      } else {
        // Page is visible again
        if (wasPlayingRef.current) {
          // Small delay to ensure stability
          setTimeout(() => {
            setIsPlaying(true);
            wasPlayingRef.current = false;
            console.log("Audio resumed after page became visible");
          }, 500);
        }
      }
    };

    // Handle audio interruptions through audio context state changes
    const handleAudioInterruption = () => {
      try {
        // Create audio context to monitor audio session state
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const checkAudioState = () => {
          if (audioContext.state === 'interrupted' || audioContext.state === 'suspended') {
            if (isPlaying) {
              wasPlayingRef.current = true;
              setIsPlaying(false);
              console.log("Audio paused due to audio context interruption");
            }
          } else if (audioContext.state === 'running' && wasPlayingRef.current) {
            setTimeout(() => {
              setIsPlaying(true);
              wasPlayingRef.current = false;
              console.log("Audio resumed after audio context resumed");
            }, 500);
          }
        };

        audioContext.addEventListener('statechange', checkAudioState);
        
        return () => {
          audioContext.removeEventListener('statechange', checkAudioState);
          audioContext.close();
        };
      } catch (error) {
        console.log("Audio context not available for interruption handling:", error);
        return () => {};
      }
    };

    // Handle media session interruptions
    const handleMediaSessionActions = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log("External pause request (possible phone call)");
          wasPlayingRef.current = true;
          setIsPlaying(false);
        });

        navigator.mediaSession.setActionHandler('play', () => {
          console.log("External play request");
          if (wasPlayingRef.current) {
            setIsPlaying(true);
            wasPlayingRef.current = false;
          }
        });
      }
    };

    // Handle beforeunload for app switching
    const handleBeforeUnload = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
      }
    };

    // Handle focus/blur events
    const handleWindowBlur = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        setIsPlaying(false);
        console.log("Audio paused due to window blur (possible phone call)");
      }
    };

    const handleWindowFocus = () => {
      if (wasPlayingRef.current) {
        setTimeout(() => {
          setIsPlaying(true);
          wasPlayingRef.current = false;
          console.log("Audio resumed after window focus");
        }, 500);
      }
    };

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    const audioCleanup = handleAudioInterruption();
    handleMediaSessionActions();

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      audioCleanup();
    };
  }, [isPlaying, setIsPlaying]);

  // Reset the ref when playback state changes externally
  useEffect(() => {
    if (isPlaying) {
      wasPlayingRef.current = false;
    }
  }, [isPlaying]);
};
