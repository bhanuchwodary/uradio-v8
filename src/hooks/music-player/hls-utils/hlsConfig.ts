
import Hls from "hls.js";

/**
 * Creates an optimized HLS.js configuration object with enhanced audio settings
 * @returns HLS.js configuration object
 */
export const createHlsConfig = (): Hls.Config => {
  // Create configuration object without using Hls as a namespace
  const config: Hls.Config = {
    enableWorker: false, // Disable web workers to prevent CORS issues
    // Buffer settings for smoother playback
    maxBufferLength: 60,
    maxMaxBufferLength: 90,
    maxBufferSize: 100 * 1000 * 1000, // 100MB buffer size
    maxBufferHole: 0.3,
    highBufferWatchdogPeriod: 5,
    
    // Quality selection settings
    startLevel: -1, // Auto select based on bandwidth
    capLevelToPlayerSize: false,
    autoStartLoad: true,
    abrEwmaDefaultEstimate: 1000000,
    
    // Error recovery settings
    maxLoadingDelay: 4,
    fragLoadingMaxRetry: 8,
    manifestLoadingMaxRetry: 8,
    levelLoadingMaxRetry: 8,
    
    // Audio specific improvements
    // We're using type-safe configuration without namespace references
  };
  
  return config;
};
