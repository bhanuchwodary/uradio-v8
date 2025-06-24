
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

  // Set additional properties for better compatibility
  audio.preload = 'auto';
  
  // Set playsInline for mobile compatibility
  (audio as any).playsInline = true;
  
  // Ensure autoplay is controlled
  audio.autoplay = false;
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
  
  const handleSecondError = () => {
    logger.error("Stream failed even with CORS", { url });
    audio.removeEventListener('error', handleSecondError);
    setIsPlaying(false);
    setLoading(false);
  };
  
  const handleSuccess = () => {
    logger.info("Stream loaded successfully with CORS fallback");
    audio.removeEventListener('canplay', handleSuccess);
    audio.removeEventListener('error', handleSecondError);
    setLoading(false);
  };
  
  audio.addEventListener('canplay', handleSuccess, { once: true });
  audio.addEventListener('error', handleSecondError, { once: true });
};
