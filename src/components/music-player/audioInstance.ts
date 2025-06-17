
import Hls from "hls.js";

type AudioInstanceType = {
  element: HTMLAudioElement | null;
  hls: Hls | null;
  activePlayerInstance: React.MutableRefObject<symbol> | null;
  isInitialized: boolean;
  currentUrl: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  navigationInProgress: boolean; // New flag to track navigation state
  explicitlyPaused: boolean; // Track if user explicitly paused vs auto-pause
};

// Maintains a shared audio and HLS context across the app
export const globalAudioRef: AudioInstanceType = {
  element: null,
  hls: null,
  activePlayerInstance: null,
  isInitialized: false,
  currentUrl: null,
  isPlaying: false,
  isPaused: false,
  navigationInProgress: false,
  explicitlyPaused: false
};

// Helper function to update global playback state with navigation awareness
export const updateGlobalPlaybackState = (
  isPlaying: boolean, 
  isPaused: boolean = false, 
  isExplicitPause: boolean = false
) => {
  globalAudioRef.isPlaying = isPlaying;
  globalAudioRef.isPaused = isPaused;
  
  // Only update explicit pause state if it's actually an explicit action
  if (isExplicitPause) {
    globalAudioRef.explicitlyPaused = isPaused;
  }
  
  console.log("Global playback state updated:", { 
    isPlaying, 
    isPaused, 
    explicitlyPaused: globalAudioRef.explicitlyPaused,
    navigationInProgress: globalAudioRef.navigationInProgress
  });
};

// New helper to manage navigation state
export const setNavigationState = (inProgress: boolean) => {
  globalAudioRef.navigationInProgress = inProgress;
  console.log("Navigation state updated:", { navigationInProgress: inProgress });
};

// Helper to check if playback should resume after navigation
export const shouldResumeAfterNavigation = (): boolean => {
  const shouldResume = !globalAudioRef.explicitlyPaused && 
                      !globalAudioRef.navigationInProgress;
  console.log("Should resume after navigation:", { 
    shouldResume,
    explicitlyPaused: globalAudioRef.explicitlyPaused,
    navigationInProgress: globalAudioRef.navigationInProgress
  });
  return shouldResume;
};
