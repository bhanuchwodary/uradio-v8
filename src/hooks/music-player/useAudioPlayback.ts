
import { useCallback } from "react";
import { updateGlobalPlaybackState } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";

interface UseAudioPlaybackProps {
  setIsPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  playRetryHandler: React.MutableRefObject<any>;
  retryTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const useAudioPlayback = ({
  setIsPlaying,
  setLoading,
  playRetryHandler,
  retryTimeoutRef
}: UseAudioPlaybackProps) => {
  const attemptPlay = useCallback(async (audio: HTMLAudioElement, retryCount: number = 0): Promise<void> => {
    try {
      logger.debug(`Attempting to play audio (attempt ${retryCount + 1})`);
      await audio.play();
      logger.debug("Playback started successfully");
      updateGlobalPlaybackState(true, false, false);
      playRetryHandler.current.reset();
    } catch (error) {
      logger.warn(`Play attempt ${retryCount + 1} failed:`, error);
      
      if (playRetryHandler.current.shouldRetry()) {
        const delay = playRetryHandler.current.getDelay();
        playRetryHandler.current.incrementRetry();
        
        logger.info(`Retrying play in ${delay}ms (attempt ${playRetryHandler.current.getRetryCount() + 1})`);
        
        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              await attemptPlay(audio, playRetryHandler.current.getRetryCount());
              resolve();
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      } else {
        logger.error("Max play retries reached, stopping playback");
        setIsPlaying(false);
        setLoading(false);
        updateGlobalPlaybackState(false, false, false);
        throw error;
      }
    }
  }, [setIsPlaying, setLoading, playRetryHandler, retryTimeoutRef]);

  return { attemptPlay };
};
