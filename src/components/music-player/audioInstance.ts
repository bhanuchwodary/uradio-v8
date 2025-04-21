
import Hls from "hls.js";

type AudioInstanceType = {
  element: HTMLAudioElement | null;
  hls: Hls | null;
  activePlayerInstance: React.RefObject<symbol> | null;
};

// Maintains a shared audio and HLS context across the app
export const globalAudioRef: AudioInstanceType = {
  element: null,
  hls: null,
  activePlayerInstance: null
};
