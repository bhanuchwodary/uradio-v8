
import Hls from 'hls.js';

/**
 * Get the HLS configuration for the audio player
 * Properly typed to avoid type errors with Hls namespace
 */
export const getHlsConfig = (): Partial<Hls.Config> => {
  // Create a config object with proper typing
  const config: Partial<Hls.Config> = {
    enableWorker: true,
    lowLatencyMode: true,
    fragLoadingTimeOut: 60000,
    manifestLoadingTimeOut: 60000,
    levelLoadingTimeOut: 60000,
    fragLoadingMaxRetry: 5,
    manifestLoadingMaxRetry: 5,
    levelLoadingMaxRetry: 5,
    maxBufferLength: 30,
  };

  return config;
};
