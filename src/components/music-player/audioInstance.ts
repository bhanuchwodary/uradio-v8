
import Hls from "hls.js";

type AudioInstanceType = {
  element: HTMLAudioElement | null;
  hls: Hls | null;
  activePlayerInstance: React.MutableRefObject<symbol> | null;
  isInitialized: boolean;
  currentUrl: string | null;
  isPlaying: boolean;
  isPaused: boolean; // Track if user explicitly paused
};

// Maintains a shared audio and HLS context across the app
export const globalAudioRef: AudioInstanceType = {
  element: null,
  hls: null,
  activePlayerInstance: null,
  isInitialized: false,
  currentUrl: null,
  isPlaying: false,
  isPaused: false // Initialize as not explicitly paused
};

// Helper function to update global playback state
export const updateGlobalPlaybackState = (isPlaying: boolean, isPaused: boolean = false) => {
  globalAudioRef.isPlaying = isPlaying;
  globalAudioRef.isPaused = isPaused;
  console.log("Global playback state updated:", { isPlaying, isPaused });
};
