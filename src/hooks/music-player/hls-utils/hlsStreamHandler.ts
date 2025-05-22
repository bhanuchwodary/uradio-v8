
import Hls from "hls.js";
import { configureAudioElement } from "./audioConfig";
import { createHlsConfig } from "./hlsConfig";

/**
 * Creates and configures an HLS instance for a given audio element and URL
 * @param audioElement The audio element to attach the HLS instance to
 * @param url The URL of the HLS stream
 * @param onManifestParsed Callback for when the manifest is parsed
 * @param onError Callback for when an error occurs
 * @returns The created HLS instance
 */
export const createHlsInstance = (
  audioElement: HTMLAudioElement,
  url: string,
  onManifestParsed: (event: any, data: any) => void,
  onError: (event: any, data: any) => void
): Hls => {
  // Create new HLS instance with optimized config
  const hls = new Hls(createHlsConfig());
  
  // Attach audio element and configure it for high quality
  hls.attachMedia(audioElement);
  configureAudioElement(audioElement);
  
  // Set up event listeners
  hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    hls.loadSource(url);
  });
  
  hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
  
  hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
    console.log(`HLS quality level switched to: ${data.level}`);
  });
  
  hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
    console.log(`HLS audio track switched to: ${data.id}`);
  });
  
  hls.on(Hls.Events.ERROR, onError);
  
  return hls;
};

/**
 * Selects the best quality level for audio playback
 * @param hls The HLS instance
 * @param data The manifest data containing levels
 * @returns The index of the selected level or -1 if unable to select
 */
export const selectBestAudioQuality = (hls: Hls, data: any): number => {
  if (!data.levels || data.levels.length === 0) return -1;
  
  // First look for pure audio levels (no video)
  const audioLevels = data.levels.filter((level: any) => !level.videoCodec);
  
  if (audioLevels.length > 0) {
    // Find the highest quality audio stream
    const bestLevel = audioLevels.reduce((prev: any, current: any) => 
      (prev.bitrate > current.bitrate) ? prev : current);
      
    const bestLevelIdx = data.levels.indexOf(bestLevel);
    console.log(`Selecting best audio quality level: ${bestLevel.bitrate} bps (index: ${bestLevelIdx})`);
    
    // Set the selected level
    hls.currentLevel = bestLevelIdx;
    hls.nextLevel = bestLevelIdx;  // Force next level to be our best level
    hls.loadLevel = bestLevelIdx;  // Load this level
    hls.startLevel = bestLevelIdx; // Set start level
    
    return bestLevelIdx;
  } else if (data.audioTracks && data.audioTracks.length > 0) {
    // If no pure audio levels, look for best audio track
    const bestAudioTrack = data.audioTracks.reduce((prev: any, current: any) => 
      (prev.bitrate > current.bitrate) ? prev : current, data.audioTracks[0]);
      
    const trackIndex = data.audioTracks.indexOf(bestAudioTrack);
    console.log(`Selecting best audio track: ${bestAudioTrack.bitrate} bps`);
    hls.audioTrack = trackIndex;
    
    return -1; // Return -1 as we're not selecting a video level, but an audio track
  }
  
  return -1;
};

/**
 * Handles HLS errors and attempts recovery when possible
 * @param hls HLS instance
 * @param data Error data
 * @param onFatalError Callback for fatal errors that can't be recovered
 * @param url Stream URL for recovery attempts
 * @param audioElement Audio element reference
 */
export const handleHlsError = (
  hls: Hls, 
  data: any, 
  onFatalError: () => void,
  url?: string,
  audioElement?: HTMLAudioElement
): void => {
  console.warn("HLS error:", data.type, data.details);
  
  if (data.fatal) {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        console.log("Network error, attempting to recover");
        hls.startLoad();
        break;
      case Hls.ErrorTypes.MEDIA_ERROR:
        console.log("Media error, attempting to recover");
        hls.recoverMediaError();
        break;
      default:
        console.error("Unrecoverable HLS error");
        onFatalError();
        
        // Try one more recovery after a short delay
        if (url && audioElement) {
          setTimeout(() => {
            console.log("Attempting final recovery of stream");
            hls.destroy();
            
            // Force restart the stream after a short delay
            audioElement.src = url;
            audioElement.load();
          }, 2000);
        }
        break;
    }
  }
};
