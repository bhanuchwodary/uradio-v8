
import Hls from "hls.js";

type AudioInstanceType = {
  element: HTMLAudioElement | null;
  hls: Hls | null;
  activePlayerInstance: React.MutableRefObject<symbol> | null;
  isInitialized: boolean;
  currentUrl: string | null;
  isPlaying: boolean; // Track global playback state
  lastTransition: number; // Track last transition time to prevent rapid switching
};

// Maintains a shared audio and HLS context across the app
export const globalAudioRef: AudioInstanceType = {
  element: null,
  hls: null,
  activePlayerInstance: null,
  isInitialized: false,
  currentUrl: null,
  isPlaying: false, // Initialize as not playing
  lastTransition: 0  // Initialize timestamp
};

// Helper functions for smoother playback transitions
export const smoothTransition = () => {
  // Prevent rapid transitions (debounce)
  const now = Date.now();
  if (now - globalAudioRef.lastTransition < 300) {
    return false; // Too soon for another transition
  }
  
  globalAudioRef.lastTransition = now;
  return true;
};
