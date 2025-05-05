
import Hls from "hls.js";

type AudioInstanceType = {
  element: HTMLAudioElement | null;
  hls: Hls | null;
  activePlayerInstance: React.MutableRefObject<symbol> | null;
  isInitialized: boolean;
  currentUrl: string | null;
  isPlaying: boolean; // Track global playback state
};

// Maintains a shared audio and HLS context across the app
export const globalAudioRef: AudioInstanceType = {
  element: null,
  hls: null,
  activePlayerInstance: null,
  isInitialized: false,
  currentUrl: null,
  isPlaying: false // Initialize as not playing
};
