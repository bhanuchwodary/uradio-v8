
import { useEffect, useRef, useCallback } from 'react';

interface AudioInterruptionOptions {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onInterruption?: () => void;
  onResumption?: () => void;
}

export const useAudioInterruption = ({
  isPlaying,
  setIsPlaying,
  onInterruption,
  onResumption
}: AudioInterruptionOptions) => {
  const wasPlayingBeforeInterruption = useRef(false);
  const interruptionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const resumeAttemptRef = useRef(0);
  const maxResumeAttempts = 3;

  // Clear any pending timeouts
  const clearInterruptionTimeout = useCallback(() => {
    if (interruptionTimeoutRef.current) {
      clearTimeout(interruptionTimeoutRef.current);
      interruptionTimeoutRef.current = null;
    }
  }, []);

  // Handle interruption (pause playback)
  const handleInterruption = useCallback((source: string) => {
    console.log(`Audio interruption detected from: ${source}`);
    
    if (isPlaying) {
      wasPlayingBeforeInterruption.current = true;
      setIsPlaying(false);
      onInterruption?.();
      console.log('Audio paused due to interruption');
    }
  }, [isPlaying, setIsPlaying, onInterruption]);

  // Handle resumption (resume playback if was playing)
  const handleResumption = useCallback((source: string, delay: number = 1000) => {
    console.log(`Audio resumption triggered from: ${source}`);
    
    if (!wasPlayingBeforeInterruption.current) {
      console.log('Was not playing before interruption, skipping resume');
      return;
    }

    clearInterruptionTimeout();
    
    interruptionTimeoutRef.current = setTimeout(() => {
      if (wasPlayingBeforeInterruption.current && !isPlaying) {
        console.log(`Attempting to resume playback (attempt ${resumeAttemptRef.current + 1})`);
        
        setIsPlaying(true);
        wasPlayingBeforeInterruption.current = false;
        resumeAttemptRef.current = 0;
        onResumption?.();
        
        console.log('Audio resumed after interruption');
      }
    }, delay);
  }, [isPlaying, setIsPlaying, onResumption, clearInterruptionTimeout]);

  // Reset state when playback starts externally
  useEffect(() => {
    if (isPlaying) {
      wasPlayingBeforeInterruption.current = false;
      resumeAttemptRef.current = 0;
      clearInterruptionTimeout();
    }
  }, [isPlaying, clearInterruptionTimeout]);

  // Setup interruption detection
  useEffect(() => {
    // 1. Page Visibility API - Most reliable for phone calls
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleInterruption('visibility-hidden');
      } else {
        handleResumption('visibility-visible', 1200);
      }
    };

    // 2. Audio Context State Monitoring
    const setupAudioContext = () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const handleAudioContextChange = () => {
          const state = audioContextRef.current?.state;
          console.log('Audio context state changed:', state);
          
          if (state === 'suspended') {
            handleInterruption('audio-context-suspended');
          } else if (state === 'running' && wasPlayingBeforeInterruption.current) {
            handleResumption('audio-context-running', 1500);
          }
        };

        audioContextRef.current.addEventListener('statechange', handleAudioContextChange);
        
        return () => {
          audioContextRef.current?.removeEventListener('statechange', handleAudioContextChange);
        };
      } catch (error) {
        console.warn('Audio context not available:', error);
        return () => {};
      }
    };

    // 3. Media Session API Integration
    const setupMediaSession = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log('Media session pause - external interruption');
          handleInterruption('media-session-pause');
        });

        navigator.mediaSession.setActionHandler('play', () => {
          console.log('Media session play - resuming from interruption');
          if (wasPlayingBeforeInterruption.current) {
            handleResumption('media-session-play', 500);
          }
        });
      }
    };

    // 4. Window focus/blur as backup
    const handleWindowFocus = () => {
      handleResumption('window-focus', 800);
    };

    const handleWindowBlur = () => {
      handleInterruption('window-blur');
    };

    // 5. Page show/hide for iOS Safari
    const handlePageShow = () => {
      handleResumption('page-show', 1000);
    };

    const handlePageHide = () => {
      handleInterruption('page-hide');
    };

    // Setup all listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);
    
    const audioContextCleanup = setupAudioContext();
    setupMediaSession();

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      
      clearInterruptionTimeout();
      audioContextCleanup();
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.warn);
      }
    };
  }, [handleInterruption, handleResumption, clearInterruptionTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterruptionTimeout();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.warn);
      }
    };
  }, [clearInterruptionTimeout]);

  return {
    wasPlayingBeforeInterruption: wasPlayingBeforeInterruption.current,
    clearInterruption: () => {
      wasPlayingBeforeInterruption.current = false;
      clearInterruptionTimeout();
    }
  };
};
