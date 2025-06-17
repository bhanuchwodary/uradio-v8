
import { logger } from "@/utils/logger";

export interface StreamConfig {
  url: string;
  type: 'hls' | 'direct' | 'vobook';
  needsCors?: boolean;
}

export const detectStreamType = (url: string): StreamConfig => {
  // Detect HLS streams
  if (url.includes('.m3u8')) {
    return {
      url,
      type: 'hls',
      needsCors: url.includes('vobook')
    };
  }
  
  // Detect VoBook streams that need CORS
  if (url.includes('vobook')) {
    return {
      url,
      type: 'vobook',
      needsCors: true
    };
  }
  
  // Default to direct stream
  return {
    url,
    type: 'direct',
    needsCors: false
  };
};

export const configureAudioForStream = (audio: HTMLAudioElement, config: StreamConfig): void => {
  logger.info("Configuring audio for stream", { 
    type: config.type, 
    needsCors: config.needsCors,
    url: config.url 
  });

  // Configure CORS if needed
  if (config.needsCors) {
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

export const handleDirectStreamError = (audio: HTMLAudioElement, config: StreamConfig): Promise<boolean> => {
  return new Promise((resolve) => {
    const handleError = () => {
      logger.warn("Direct stream failed, trying with CORS", { url: config.url });
      
      // Try with CORS as fallback
      audio.crossOrigin = 'anonymous';
      audio.load();
      
      const handleSecondError = () => {
        logger.error("Stream failed even with CORS", { url: config.url });
        audio.removeEventListener('error', handleSecondError);
        resolve(false);
      };
      
      const handleSuccess = () => {
        logger.info("Stream loaded successfully with CORS fallback");
        audio.removeEventListener('canplay', handleSuccess);
        audio.removeEventListener('error', handleSecondError);
        resolve(true);
      };
      
      audio.addEventListener('canplay', handleSuccess, { once: true });
      audio.addEventListener('error', handleSecondError, { once: true });
      
      audio.removeEventListener('error', handleError);
    };
    
    audio.addEventListener('error', handleError, { once: true });
  });
};
