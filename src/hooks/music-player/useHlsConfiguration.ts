
import { useCallback } from "react";
import Hls from "hls.js";
import { logger } from "@/utils/logger";

interface UseHlsConfigurationProps {
  setLoading: (loading: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  loadRetryHandler: React.MutableRefObject<any>;
  clearLoadTimeout: () => void;
}

export const useHlsConfiguration = ({
  setLoading,
  setIsPlaying,
  loadRetryHandler,
  clearLoadTimeout
}: UseHlsConfigurationProps) => {
  const createHlsInstance = useCallback(() => {
    return new Hls({
      enableWorker: false,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxLoadingDelay: 6,
      maxBufferLength: 30,
      maxBufferSize: 60 * 1000 * 1000,
      liveSyncDurationCount: 3,
      liveMaxLatencyDurationCount: 10,
      fragLoadingRetryDelay: 2000,
      fragLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 2000,
      manifestLoadingMaxRetry: 4
    });
  }, []);

  const setupHlsEventHandlers = useCallback((hls: Hls, hlsRef: React.MutableRefObject<Hls | null>) => {
    hls.on(Hls.Events.ERROR, (event, data) => {
      logger.error("HLS Error:", data);
      if (data.fatal) {
        const backoffDelay = Math.min(2000 * Math.pow(2, loadRetryHandler.current.getRetryCount()), 16000);
        
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            logger.warn(`HLS network error, retrying in ${backoffDelay}ms...`);
            if (loadRetryHandler.current.shouldRetry()) {
              loadRetryHandler.current.incrementRetry();
              setTimeout(() => {
                if (hlsRef.current) {
                  hlsRef.current.recoverMediaError();
                }
              }, backoffDelay);
            } else {
              logger.error("Max HLS network retries reached. Stopping playback.");
              setIsPlaying(false);
              setLoading(false);
            }
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            logger.warn(`HLS media error, retrying in ${backoffDelay}ms...`);
            if (loadRetryHandler.current.shouldRetry()) {
              loadRetryHandler.current.incrementRetry();
              setTimeout(() => {
                if (hlsRef.current) {
                  hlsRef.current.recoverMediaError();
                }
              }, backoffDelay);
            } else {
              logger.error("Max HLS media retries reached. Stopping playback.");
              setIsPlaying(false);
              setLoading(false);
            }
            break;
          default:
            logger.error("Fatal HLS error, destroying HLS instance.", data);
            hls.destroy();
            hlsRef.current = null;
            setIsPlaying(false);
            setLoading(false);
            break;
        }
      }
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      logger.debug("HLS manifest parsed, ready to play");
      setLoading(false);
      clearLoadTimeout();
      loadRetryHandler.current.reset();
    });

    hls.on(Hls.Events.FRAG_LOADED, () => {
      logger.debug("HLS fragment loaded");
      setLoading(false);
      clearLoadTimeout();
    });

    hls.on(Hls.Events.BUFFER_APPENDED, () => {
      setLoading(false);
    });
  }, [setLoading, setIsPlaying, loadRetryHandler, clearLoadTimeout]);

  return {
    createHlsInstance,
    setupHlsEventHandlers
  };
};
