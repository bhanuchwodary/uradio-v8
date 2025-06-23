
import { useEffect, useRef } from "react";
import { globalAudioRef, updateGlobalPlaybackState, setNavigationState, resetAudioStateForUserAction } from "@/components/music-player/audioInstance";

export const usePhoneCallHandling = (
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void
) => {
  const wasPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const callDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to actually resume audio playback
  const resumeAudioPlayback = async () => {
    console.log("Attempting to resume audio playback...");
    
    try {
      // Reset global audio state first
      resetAudioStateForUserAction();
      
      // Update state
      setIsPlaying(true);
      
      // Actually play the audio element if it exists
      if (globalAudioRef.element && !globalAudioRef.element.paused) {
        console.log("Audio element already playing");
        return;
      }
      
      if (globalAudioRef.element) {
        console.log("Starting audio element playback");
        await globalAudioRef.element.play();
        updateGlobalPlaybackState(true, false, false);
        console.log("Audio playback resumed successfully");
      } else {
        console.log("No audio element available to resume");
      }
      
      wasPlayingRef.current = false;
    } catch (error) {
      console.log("Failed to resume audio playback:", error);
      // Fallback - just update state
      setIsPlaying(true);
      wasPlayingRef.current = false;
    }
  };

  useEffect(() => {
    // Enhanced phone call detection for mobile devices
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (could be due to phone call or other interruption)
        if (isPlaying) {
          wasPlayingRef.current = true;
          // Update global state to indicate interruption, not user pause
          updateGlobalPlaybackState(false, true, false);
          setIsPlaying(false);
          console.log("Audio paused due to page visibility change (possible phone call)");
        }
      } else {
        // Page is visible again - add delay to ensure call has ended
        if (wasPlayingRef.current) {
          // Clear any existing timeout
          if (callDetectionTimeoutRef.current) {
            clearTimeout(callDetectionTimeoutRef.current);
          }
          
          // Wait longer before resuming to ensure call has actually ended
          callDetectionTimeoutRef.current = setTimeout(() => {
            console.log("Page became visible - attempting to resume audio");
            resumeAudioPlayback();
          }, 1000);
        }
      }
    };

    // Enhanced audio context monitoring for mobile
    const handleAudioInterruption = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const checkAudioState = () => {
          if (audioContext.state === 'interrupted' || audioContext.state === 'suspended') {
            if (isPlaying) {
              wasPlayingRef.current = true;
              // Update global state to indicate interruption
              updateGlobalPlaybackState(false, true, false);
              setIsPlaying(false);
              console.log("Audio paused due to audio context interruption (phone call detected)");
            }
          } else if (audioContext.state === 'running' && wasPlayingRef.current) {
            // Clear any existing timeout
            if (callDetectionTimeoutRef.current) {
              clearTimeout(callDetectionTimeoutRef.current);
            }
            
            // Add delay before resuming
            callDetectionTimeoutRef.current = setTimeout(() => {
              console.log("Audio context resumed - attempting to resume audio");
              resumeAudioPlayback();
            }, 1000);
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

    // Enhanced media session for better mobile integration
    const handleMediaSessionActions = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log("External pause request (phone call or system interruption)");
          wasPlayingRef.current = true;
          // Update global state to indicate interruption
          updateGlobalPlaybackState(false, true, false);
          setIsPlaying(false);
        });

        navigator.mediaSession.setActionHandler('play', () => {
          console.log("External play request");
          if (wasPlayingRef.current) {
            // Clear any existing timeout
            if (callDetectionTimeoutRef.current) {
              clearTimeout(callDetectionTimeoutRef.current);
            }
            
            callDetectionTimeoutRef.current = setTimeout(() => {
              console.log("External play request - attempting to resume audio");
              resumeAudioPlayback();
            }, 500);
          }
        });

        // Handle stop action (often triggered by phone calls on mobile)
        navigator.mediaSession.setActionHandler('stop', () => {
          console.log("External stop request (likely phone call)");
          wasPlayingRef.current = true;
          // Update global state to indicate interruption
          updateGlobalPlaybackState(false, true, false);
          setIsPlaying(false);
        });
      }
    };

    // Enhanced beforeunload for app switching/phone calls
    const handleBeforeUnload = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        console.log("App unloading - pausing audio");
      }
    };

    // Enhanced focus/blur events with better mobile detection
    const handleWindowBlur = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        // Update global state to indicate interruption
        updateGlobalPlaybackState(false, true, false);
        setIsPlaying(false);
        console.log("Audio paused due to window blur (possible phone call)");
      }
    };

    const handleWindowFocus = () => {
      if (wasPlayingRef.current) {
        // Clear any existing timeout
        if (callDetectionTimeoutRef.current) {
          clearTimeout(callDetectionTimeoutRef.current);
        }
        
        // Longer delay for focus events to ensure call has ended
        callDetectionTimeoutRef.current = setTimeout(() => {
          console.log("Window focused - attempting to resume audio");
          resumeAudioPlayback();
        }, 1500);
      }
    };

    // Mobile-specific: Page lifecycle events for better call detection
    const handlePageFreeze = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        // Update global state to indicate interruption
        updateGlobalPlaybackState(false, true, false);
        setIsPlaying(false);
        console.log("Audio paused due to page freeze (mobile background/call)");
      }
    };

    const handlePageResume = () => {
      if (wasPlayingRef.current) {
        // Clear any existing timeout
        if (callDetectionTimeoutRef.current) {
          clearTimeout(callDetectionTimeoutRef.current);
        }
        
        callDetectionTimeoutRef.current = setTimeout(() => {
          console.log("Page resumed - attempting to resume audio");
          resumeAudioPlayback();
        }, 1000);
      }
    };

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    // Mobile-specific lifecycle events
    window.addEventListener('freeze', handlePageFreeze);
    window.addEventListener('resume', handlePageResume);
    
    const audioCleanup = handleAudioInterruption();
    handleMediaSessionActions();

    // Cleanup function
    return () => {
      // Clear any pending timeouts
      if (callDetectionTimeoutRef.current) {
        clearTimeout(callDetectionTimeoutRef.current);
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('freeze', handlePageFreeze);
      window.removeEventListener('resume', handlePageResume);
      
      audioCleanup();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isPlaying, setIsPlaying]);

  // Reset the ref when playback state changes externally
  useEffect(() => {
    if (isPlaying) {
      wasPlayingRef.current = false;
      // Clear any pending resume timeouts when user manually starts playback
      if (callDetectionTimeoutRef.current) {
        clearTimeout(callDetectionTimeoutRef.current);
        callDetectionTimeoutRef.current = null;
      }
    }
  }, [isPlaying]);
};
