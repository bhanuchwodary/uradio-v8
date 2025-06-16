
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";

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

    // Check if we're already playing this URL and don't reload
    if (url === lastUrlRef.current && audioRef.current.src && !audioRef.current.paused === isPlaying) {
      logger.debug("URL and playback state unchanged, maintaining current playback");
      return;
    }

    lastUrlRef.current = url;
    
    // Only show loading if we're actually changing the URL
    if (audioRef.current.src !== url) {
      setLoading(true);
    }
    
    // Clean up previous HLS instance if exists and if URL has changed
    if (globalAudioRef.hls && audioRef.current.src !== url) {
      logger.debug("Destroying previous HLS instance");
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }

    // Check if the URL is an HLS stream
    if (url.includes('.m3u8') && Hls.isSupported()) {
      logger.info("Loading HLS stream", { url });
      
      // Only create a new HLS instance if needed
      if (!globalAudioRef.hls) {
        const hls = new Hls({
          enableWorker: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
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
        
        if (audioRef.current) {
          audioRef.current.preload = "auto";
        }
        
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
          retryCountRef.current = 0; // Reset retry count on successful load
          
          if (isPlaying) {
            audioRef.current?.play().catch(error => {
              logger.error("Error playing HLS stream", error);
              setIsPlaying(false);
            });
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
      // Regular audio stream
      logger.info("Loading regular audio stream", { url });
      audioRef.current.src = url;
      audioRef.current.load();
      
      try {
        audioRef.current.autoplay = false;
        audioRef.current.preload = "auto";
      } catch (e) {
        logger.warn("Some audio enhancements not supported by this browser");
      }
      
      audioRef.current.oncanplay = () => {
        setLoading(false);
        retryCountRef.current = 0; // Reset retry count on successful load
        
        if (isPlaying) {
          audioRef.current?.play().catch(error => {
            logger.error("Error playing audio stream", error);
            setIsPlaying(false);
          });
        }
      };

      audioRef.current.onerror = () => {
        logger.error("Audio loading error", { url });
        setLoading(false);
        setIsPlaying(false);
      };
    } else {
      // URL is the same, just sync playback state
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          logger.error("Error resuming audio stream", error);
          setIsPlaying(false);
        });
      } else {
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
