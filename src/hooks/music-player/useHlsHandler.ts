
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { detectStreamType, configureAudioForStream, handleDirectStreamError } from "@/utils/streamHandler";

interface UseHlsHandlerProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  url: string | undefined;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useHlsHandler = ({
  audioRef,
  url,
  isPlaying,
  setIsPlaying,
  setLoading
}: UseHlsHandlerProps) => {
  const hlsRef = useRef<Hls | null>(null);
  const lastUrlRef = useRef<string | undefined>(undefined);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!audioRef.current || !url) {
      return;
    }

    // CRITICAL: Only handle explicit play/pause requests, never auto-start
    if (url === lastUrlRef.current && audioRef.current.src) {
      // URL hasn't changed, just handle play/pause state
      if (isPlaying) {
        logger.debug("Explicit play request for current URL");
        audioRef.current.play().catch(error => {
          logger.error("Error playing current stream", error);
          setIsPlaying(false);
        });
      } else {
        logger.debug("Explicit pause request");
        audioRef.current.pause();
      }
      return;
    }

    lastUrlRef.current = url;
    setLoading(true);
    
    // Clean up previous HLS instance if URL changed
    if (globalAudioRef.hls && audioRef.current.src !== url) {
      logger.debug("Destroying previous HLS instance for URL change");
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }

    // Detect stream type and configure accordingly
    const streamConfig = detectStreamType(url);
    configureAudioForStream(audioRef.current, streamConfig);

    // Handle HLS streams - LOAD ONLY, NO AUTO-PLAY
    if (streamConfig.type === 'hls' && Hls.isSupported()) {
      logger.info("Loading HLS stream (no auto-play)", { url, config: streamConfig });
      
      if (!globalAudioRef.hls) {
        const hls = new Hls({
          enableWorker: false,
          maxBufferLength: 15,
          maxMaxBufferLength: 30,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferHole: 0.3,
          startLevel: -1,
          capLevelToPlayerSize: false,
          autoStartLoad: true,
          abrEwmaDefaultEstimate: 500000,
          maxLoadingDelay: 4,
          fragLoadingMaxRetry: maxRetries,
          manifestLoadingMaxRetry: maxRetries,
          levelLoadingMaxRetry: maxRetries
        });
        
        hls.attachMedia(audioRef.current);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(url);
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          logger.info("HLS manifest loaded", { levels: data.levels?.length || 0 });
          
          if (data.levels && data.levels.length > 1) {
            const audioLevels = data.levels.filter(level => !level.videoCodec);
            const bestLevel = audioLevels.length > 0 
              ? audioLevels.reduce((prev, current) => 
                  (prev.bitrate > current.bitrate) ? prev : current) 
              : null;
              
            if (bestLevel) {
              const bestLevelIdx = data.levels.indexOf(bestLevel);
              logger.debug(`Selecting best audio quality level: ${bestLevel.bitrate} bps`);
              hls.currentLevel = bestLevelIdx;
            }
          }
          
          setLoading(false);
          retryCountRef.current = 0;
          
          // CRITICAL: NEVER auto-play, only play if explicitly requested
          if (isPlaying) {
            logger.debug("HLS loaded and explicit play requested, starting playback");
            audioRef.current?.play().catch(error => {
              logger.error("Error playing HLS stream", error);
              setIsPlaying(false);
            });
          } else {
            logger.debug("HLS stream loaded and ready, waiting for user interaction");
          }
        });
        
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          logger.debug(`HLS quality level switched to: ${data.level}`);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          logger.error("HLS error", data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (retryCountRef.current < maxRetries) {
                  logger.warn(`Network error, attempting retry ${retryCountRef.current + 1}/${maxRetries}`);
                  retryCountRef.current++;
                  setTimeout(() => hls.startLoad(), 1000 * retryCountRef.current);
                } else {
                  logger.error("Max network retries exceeded");
                  setIsPlaying(false);
                  setLoading(false);
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                if (retryCountRef.current < maxRetries) {
                  logger.warn(`Media error, attempting recovery ${retryCountRef.current + 1}/${maxRetries}`);
                  retryCountRef.current++;
                  hls.recoverMediaError();
                } else {
                  logger.error("Max media recovery attempts exceeded");
                  setIsPlaying(false);
                  setLoading(false);
                }
                break;
              default:
                logger.error("Unrecoverable HLS error");
                setIsPlaying(false);
                setLoading(false);
                break;
            }
          }
        });
        
        globalAudioRef.hls = hls;
      } else if (globalAudioRef.hls) {
        globalAudioRef.hls.loadSource(url);
      }
    } else if (audioRef.current.src !== url) {
      // Handle direct streams - LOAD ONLY, NO AUTO-PLAY
      logger.info("Loading direct audio stream (no auto-play)", { url, config: streamConfig });
      audioRef.current.src = url;
      audioRef.current.load();
      
      audioRef.current.oncanplay = () => {
        setLoading(false);
        retryCountRef.current = 0;
        
        // CRITICAL: NEVER auto-play, only play if explicitly requested
        if (isPlaying) {
          logger.debug("Direct stream loaded and explicit play requested, starting playback");
          audioRef.current?.play().catch(error => {
            logger.error("Error playing direct stream", error);
            setIsPlaying(false);
          });
        } else {
          logger.debug("Direct stream loaded and ready, waiting for user interaction");
        }
      };

      audioRef.current.onerror = async () => {
        logger.warn("Direct stream error, attempting fallback", { url });
        
        const success = await handleDirectStreamError(audioRef.current!, streamConfig);
        if (!success) {
          setLoading(false);
          setIsPlaying(false);
        }
      };
    } else {
      // URL is the same, handle explicit play/pause
      if (isPlaying) {
        logger.debug("Explicit play request for loaded stream");
        audioRef.current.play().catch(error => {
          logger.error("Error starting playback", error);
          setIsPlaying(false);
        });
      } else {
        logger.debug("Explicit pause request");
        audioRef.current.pause();
      }
      setLoading(false);
    }

    return () => {
      // Cleanup handled globally to maintain playback across components
    };
  }, [url, isPlaying, audioRef, setIsPlaying, setLoading]);

  return { hlsRef };
};
