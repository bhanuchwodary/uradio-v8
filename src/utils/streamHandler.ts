
import { logger } from "@/utils/logger";

export type StreamType = 'hls' | 'direct' | 'vobook';

export interface StreamConfig {
  url: string;
  type: StreamType;
  needsCors?: boolean;
}

export const detectStreamType = (url: string): StreamType => {
  // Detect HLS streams
  if (url.includes('.m3u8')) {
    return 'hls';
  }
  
  // Detect VoBook streams that need CORS
  if (url.includes('vobook')) {
    return 'vobook';
  }
  
  // Default to direct stream
  return 'direct';
};

export const configureAudioForStream = (audio: HTMLAudioElement, streamType: StreamType): void => {
  logger.info("Configuring audio for stream", { 
    type: streamType
  });

  // Configure CORS if needed
  if (streamType === 'vobook' || streamType === 'hls') {
    audio.crossOrigin = 'anonymous';
  } else {
    // Remove crossOrigin attribute for non-CORS streams
    audio.removeAttribute('crossOrigin');
  }

  // Set additional properties for better compatibility and performance
  audio.preload = 'auto';
  
  // Set playsInline for mobile compatibility
  (audio as any).playsInline = true;
  
  // Ensure autoplay is controlled
  audio.autoplay = false;
  
  // Optimize for live streams
  if (streamType === 'hls' || streamType === 'direct') {
    // Set buffer size for better streaming performance
    try {
      // These are browser-specific optimizations
      (audio as any).networkState = HTMLMediaElement.NETWORK_LOADING;
    } catch (error) {
      // Silently ignore if browser doesn't support these properties
    }
  }
};

export const handleDirectStreamError = (
  audio: HTMLAudioElement, 
  setIsPlaying: (playing: boolean) => void, 
  setLoading: (loading: boolean) => void, 
  url: string
): void => {
  logger.warn("Direct stream failed, trying with CORS", { url });
  
  // Try with CORS as fallback
  audio.crossOrigin = 'anonymous';
  audio.load();
  
  // Set a timeout for the CORS retry
  const corsTimeout = setTimeout(() => {
    logger.error("CORS fallback also timed out", { url });
    audio.removeEventListener('error', handleSecondError);
    audio.removeEventListener('canplay', handleSuccess);
    setIsPlaying(false);
    setLoading(false);
  }, 15000); // Extended to 15 second timeout for CORS retry
  
  const handleSecondError = () => {
    logger.error("Stream failed even with CORS", { url });
    clearTimeout(corsTimeout);
    audio.removeEventListener('error', handleSecondError);
    audio.removeEventListener('canplay', handleSuccess);
    setIsPlaying(false);
    setLoading(false);
  };
  
  const handleSuccess = () => {
    logger.info("Stream loaded successfully with CORS fallback");
    clearTimeout(corsTimeout);
    audio.removeEventListener('canplay', handleSuccess);
    audio.removeEventListener('error', handleSecondError);
    setLoading(false);
  };
  
  audio.addEventListener('canplay', handleSuccess, { once: true });
  audio.addEventListener('error', handleSecondError, { once: true });
};

// Enhanced utility function for creating connection timeout
export const createConnectionTimeout = (
  timeoutMs: number,
  onTimeout: () => void
): (() => void) => {
  const timeoutId = setTimeout(onTimeout, timeoutMs);
  return () => clearTimeout(timeoutId);
};

// Enhanced error recovery with exponential backoff and better configuration
export const createRetryHandler = (
  maxRetries: number,
  baseDelay: number = 1000
) => {
  let retryCount = 0;
  
  return {
    shouldRetry: () => retryCount < maxRetries,
    getDelay: () => {
      // Exponential backoff with jitter to prevent thundering herd
      const exponentialDelay = baseDelay * Math.pow(2, retryCount);
      const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
      return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
    },
    incrementRetry: () => retryCount++,
    reset: () => { retryCount = 0; },
    getRetryCount: () => retryCount
  };
};
