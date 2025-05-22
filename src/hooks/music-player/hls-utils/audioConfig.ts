
/**
 * Applies high-quality playback settings to an audio element
 * @param audioElement HTML Audio Element to configure
 */
export const configureAudioElement = (audioElement: HTMLAudioElement): void => {
  if (!audioElement) return;
  
  // Basic audio settings
  audioElement.preload = "auto";
  
  try {
    // Enhanced audio fidelity during rate changes
    audioElement.preservesPitch = false;
    
    // Browser-specific properties with type assertions
    try {
      // Firefox-specific
      (audioElement as any).mozPreservesPitch = false;
    } catch (e) {
      // Silently fail if not supported
    }
    
    try {
      // Safari/Webkit-specific
      (audioElement as any).webkitPreservesPitch = false;
    } catch (e) {
      // Silently fail if not supported
    }
    
    // Set high quality sample rate if supported
    try {
      // @ts-ignore - Non-standard but useful in some browsers
      if (audioElement.mozSampleRate) {
        // @ts-ignore - Firefox specific
        audioElement.mozSampleRate = 48000;
      }
    } catch (e) {
      // Silently fail if not supported
    }
  } catch (e) {
    console.log("Advanced audio properties not supported by this browser");
  }
};

/**
 * Configure standard audio element for regular streams (non-HLS)
 * @param audioElement HTML Audio Element to configure
 */
export const configureStandardAudio = (audioElement: HTMLAudioElement): void => {
  if (!audioElement) return;
  
  try {
    // Set audio quality attributes
    audioElement.autoplay = false;
    audioElement.preload = "auto";
    
    // Set audio processing mode to high quality if available
    if ('audioProcessing' in audioElement) {
      // @ts-ignore - This is a non-standard property
      audioElement.audioProcessing = 'highquality';
    }
    
    // Try to enable high quality mode using various browser-specific methods
    if ('webkitAudioDecodedByteCount' in audioElement) {
      // This forces some browsers to use higher quality decoding
      audioElement.volume = 0.99;
      setTimeout(() => {
        if (audioElement) audioElement.volume = 1.0;
      }, 10);
    }
  } catch (e) {
    console.log("Some audio enhancements not supported by this browser");
  }
};
