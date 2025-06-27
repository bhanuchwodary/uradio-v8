
import { useCallback } from "react";
import { logger } from "@/utils/logger";
import { handleDirectStreamError } from "@/utils/streamHandler";

interface UseDirectStreamHandlerProps {
  setIsPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  loadRetryHandler: React.MutableRefObject<any>;
  clearLoadTimeout: () => void;
}

export const useDirectStreamHandler = ({
  setIsPlaying,
  setLoading,
  loadRetryHandler,
  clearLoadTimeout
}: UseDirectStreamHandlerProps) => {
  const setupDirectStreamHandlers = useCallback((audio: HTMLAudioElement, url: string) => {
    const handleError = () => {
      logger.warn("Direct stream error, trying with CORS and retries");
      
      if (loadRetryHandler.current.shouldRetry()) {
        loadRetryHandler.current.incrementRetry();
        const delay = loadRetryHandler.current.getDelay();
        
        setTimeout(() => {
          handleDirectStreamError(audio, setIsPlaying, setLoading, url);
        }, delay);
      } else {
        logger.error("Max direct stream retries reached");
        setIsPlaying(false);
        setLoading(false);
      }
    };
    
    const handleCanPlay = () => {
      logger.debug("Audio can play");
      setLoading(false);
      clearLoadTimeout();
      loadRetryHandler.current.reset();
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };

    const handleLoadStart = () => {
      logger.debug("Audio load started");
      setLoading(true);
    };

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        logger.debug("Audio buffering progress");
        setLoading(false);
      }
    };

    const handleStalled = () => {
      logger.warn("Audio playback stalled, attempting recovery");
      if (loadRetryHandler.current.shouldRetry()) {
        loadRetryHandler.current.incrementRetry();
        const delay = loadRetryHandler.current.getDelay();
        setTimeout(() => {
          audio.load();
        }, delay);
      }
    };

    audio.addEventListener('error', handleError, { once: true });
    audio.addEventListener('canplay', handleCanPlay, { once: true });
    audio.addEventListener('loadstart', handleLoadStart, { once: true });
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('stalled', handleStalled);

    // Store cleanup for later use
    (audio as any)._directStreamCleanup = () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('stalled', handleStalled);
    };
  }, [setIsPlaying, setLoading, loadRetryHandler, clearLoadTimeout]);

  return { setupDirectStreamHandlers };
};
