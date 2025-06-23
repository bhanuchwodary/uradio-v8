import { useEffect, useRef, useCallback } from "react";
import { globalAudioRef, updateGlobalPlaybackState, resetAudioStateForUserAction } from "@/components/music-player/audioInstance";

export const usePhoneCallHandling = (
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void
) => {
  const wasPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const callDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to actually resume audio playback
  // Use useCallback to memoize this function, preventing unnecessary re-creations
  // which can be useful if it's passed down to child components.
  const resumeAudioPlayback = useCallback(async () => {
    console.log("Attempting to resume audio playback...");

    if (!globalAudioRef.element) {
      console.log("No audio element available to resume.");
      // Potentially set isPlaying to false if no element can play
      setIsPlaying(false);
      wasPlayingRef.current = false;
      return;
    }

    try {
      // It's crucial that resetAudioStateForUserAction does not detach the audio element
      // or set its src to null/empty string.
      resetAudioStateForUserAction();
      console.log("Global audio state reset.");

      // Attempt to resume AudioContext if it's suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log("Resuming AudioContext...");
        await audioContextRef.current.resume();
      }

      // Check if audio element is already playing (e.g., from another source resuming it)
      if (!globalAudioRef.element.paused) {
        console.log("Audio element already playing, no need to resume.");
        setIsPlaying(true); // Ensure React state is aligned
        wasPlayingRef.current = false;
        return;
      }

      console.log("Starting audio element playback...");
      await globalAudioRef.element.play();
      
      // Only update state if play() promise resolves successfully
      setIsPlaying(true);
      updateGlobalPlaybackState(true, false, false);
      console.log("Audio playback resumed successfully.");
      wasPlayingRef.current = false; // Reset after successful resume

    } catch (error) {
      console.error("Failed to resume audio playback:", error);
      // More specific error handling for autoplay policy
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        console.warn("Autoplay was prevented. User interaction required to resume playback.");
        // You might want to show a UI element here prompting the user to tap to resume.
        // For example: setNeedsUserInteractionToPlay(true);
      } else {
        console.error("An unexpected error occurred during audio resume:", error);
      }
      // Fallback: If playing failed, ensure UI reflects paused state
      setIsPlaying(false);
      // Keep wasPlayingRef.current true if it failed due to autoplay,
      // so next user interaction can try again.
      // Or set it to false if the error implies it's truly not resumable.
      // For now, let's keep it true so a retry is possible.
      // wasPlayingRef.current = false; // You might want to change this based on specific error
    }
  }, [setIsPlaying]); // Dependencies for useCallback

  useEffect(() => {
    // Helper to clear timeout
    const clearResumeTimeout = () => {
      if (callDetectionTimeoutRef.current) {
        clearTimeout(callDetectionTimeoutRef.current);
        callDetectionTimeoutRef.current = null;
      }
    };

    // --- Event Handlers ---

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlaying) {
          wasPlayingRef.current = true;
          updateGlobalPlaybackState(false, true, false);
          setIsPlaying(false);
          console.log("Audio paused due to page visibility change (possible phone call)");
        }
      } else {
        if (wasPlayingRef.current) {
          clearResumeTimeout();
          callDetectionTimeoutRef.current = setTimeout(() => {
            console.log("Page became visible - attempting to resume audio");
            resumeAudioPlayback();
          }, 1000);
        }
      }
    };

    const handleAudioInterruption = () => {
      try {
        // Ensure AudioContext is created on a user gesture or after initial load
        // Creating it here in useEffect might lead to it being suspended immediately.
        // A better approach is to manage a single AudioContext instance globally
        // or ensure it's un-suspended by an initial user gesture.
        // For this example, let's assume it gets created properly elsewhere or on first interaction.

        const audioContext = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext; // Store reference

        const checkAudioState = () => {
          console.log("AudioContext state change:", audioContext.state);
          if (audioContext.state === 'interrupted' || audioContext.state === 'suspended') {
            if (isPlaying) {
              wasPlayingRef.current = true;
              updateGlobalPlaybackState(false, true, false);
              setIsPlaying(false);
              console.log("Audio paused due to audio context interruption (phone call detected)");
            }
          } else if (audioContext.state === 'running' && wasPlayingRef.current) {
            clearResumeTimeout();
            callDetectionTimeoutRef.current = setTimeout(() => {
              console.log("Audio context resumed - attempting to resume audio");
              resumeAudioPlayback();
            }, 1000);
          }
        };

        // Important: Add event listener to the *current* audioContext
        audioContext.addEventListener('statechange', checkAudioState);

        return () => {
          audioContext.removeEventListener('statechange', checkAudioState);
          // Don't close audioContext here if it's meant to be global/persistent
          // Consider closing it only when the component unmounts for good,
          // or if the app explicitly wants to release audio resources.
          // For now, let's keep the existing close() call for consistency.
          audioContext.close();
        };
      } catch (error) {
        console.log("Audio context not available for interruption handling:", error);
        return () => {}; // Return empty cleanup
      }
    };

    const handleMediaSessionActions = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log("External pause request (phone call or system interruption)");
          wasPlayingRef.current = true;
          updateGlobalPlaybackState(false, true, false);
          setIsPlaying(false);
        });

        navigator.mediaSession.setActionHandler('play', () => {
          console.log("External play request received.");
          if (wasPlayingRef.current) {
            clearResumeTimeout();
            callDetectionTimeoutRef.current = setTimeout(() => {
              console.log("External play request - attempting to resume audio");
              resumeAudioPlayback();
            }, 500);
          }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          console.log("External stop request (likely phone call)");
          wasPlayingRef.current = true;
          updateGlobalPlaybackState(false, true, false);
          setIsPlaying(false);
        });
      }
    };

    const handleBeforeUnload = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        console.log("App unloading - pausing audio");
      }
    };

    const handleWindowBlur = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        updateGlobalPlaybackState(false, true, false);
        setIsPlaying(false);
        console.log("Audio paused due to window blur (possible phone call)");
      }
    };

    const handleWindowFocus = () => {
      if (wasPlayingRef.current) {
        clearResumeTimeout();
        callDetectionTimeoutRef.current = setTimeout(() => {
          console.log("Window focused - attempting to resume audio");
          resumeAudioPlayback();
        }, 1500);
      }
    };

    const handlePageFreeze = () => {
      if (isPlaying) {
        wasPlayingRef.current = true;
        updateGlobalPlaybackState(false, true, false);
        setIsPlaying(false);
        console.log("Audio paused due to page freeze (mobile background/call)");
      }
    };

    const handlePageResume = () => {
      if (wasPlayingRef.current) {
        clearResumeTimeout();
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
    window.addEventListener('freeze', handlePageFreeze);
    window.addEventListener('resume', handlePageResume);

    const audioContextCleanup = handleAudioInterruption(); // Call it here
    handleMediaSessionActions(); // Call it here

    // Cleanup function
    return () => {
      clearResumeTimeout(); // Clear any pending timeouts on unmount

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('freeze', handlePageFreeze);
      window.removeEventListener('resume', handlePageResume);

      audioContextCleanup(); // Run audio context specific cleanup
      
      // Only close audioContext here if this hook is the sole manager of its lifecycle.
      // If it's a global AudioContext, it might be better managed elsewhere.
      if (audioContextRef.current) {
        // audioContextRef.current.close(); // Only if it's safe to close
      }
    };
  }, [isPlaying, setIsPlaying, resumeAudioPlayback]); // Add resumeAudioPlayback to dependencies

  // This useEffect ensures wasPlayingRef is reset when playback starts externally
  // and clears any pending resume timeouts.
  useEffect(() => {
    if (isPlaying) {
      wasPlayingRef.current = false;
      if (callDetectionTimeoutRef.current) {
        clearTimeout(callDetectionTimeoutRef.current);
        callDetectionTimeoutRef.current = null;
      }
    }
  }, [isPlaying]);
};
