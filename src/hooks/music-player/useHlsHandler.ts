
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef, updateGlobalPlaybackState } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { detectStreamType, configureAudioForStream, handleDirectStreamError, createRetryHandler } from "@/utils/streamHandler";

interface UseHlsHandlerProps {
  url: string | undefined;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useHlsHandler = ({
  url,
  isPlaying,
  setIsPlaying,
  setLoading
}: UseHlsHandlerProps) => {
  const hlsRef = useRef<Hls | null>(null);
  const lastUrlRef = useRef<string | undefined>(undefined);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadRetryHandler = useRef(createRetryHandler(5, 2000)); // 5 retries with 2s base delay
  const playRetryHandler = useRef(createRetryHandler(3, 1000)); // 3 play retries with 1s base delay
  const loadTimeout = 20000; // 20 seconds timeout for initial load

  // Enhanced play function with retry logic
  const attemptPlay = async (audio: HTMLAudioElement, retryCount: number = 0): Promise<void> => {
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
  };

  useEffect(() => {
    // Ensure global audio element exists
    if (!globalAudioRef.element) {
      const audio = new Audio();
      audio.preload = 'auto';
      globalAudioRef.element = audio;
      logger.debug("Created global audio element in HLS handler");
    }

    const audio = globalAudioRef.element;

    if (!url) {
      // Clear audio when no URL
      if (audio) {
        audio.pause();
        audio.src = "";
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      }
      setIsPlaying(false);
      setLoading(false);
      // Clear any pending timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      return;
    }

    // Only re-configure HLS or change source if URL actually changed
    if (url !== lastUrlRef.current) {
      logger.debug(`URL changed from ${lastUrlRef.current} to ${url}. Re-initializing stream.`);
      setLoading(true);

      // Clear any existing timeouts
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Reset retry handlers for new URL
      loadRetryHandler.current.reset();
      playRetryHandler.current.reset();

      // Set a timeout for loading with exponential backoff
      const setupLoadTimeout = () => {
        const delay = loadRetryHandler.current.getDelay();
        loadTimeoutRef.current = setTimeout(() => {
          logger.warn(`Stream loading timeout reached (${delay}ms)`);
          
          if (loadRetryHandler.current.shouldRetry()) {
            loadRetryHandler.current.incrementRetry();
            logger.info(`Retrying stream load (attempt ${loadRetryHandler.current.getRetryCount()}/${5})`);
            
            // Reset and retry
            if (hlsRef.current) {
              hlsRef.current.destroy();
              hlsRef.current = null;
            }
            audio.src = "";
            audio.load();
            setupLoadTimeout(); // Setup next timeout
          } else {
            logger.error("Max load retries reached for stream");
            setIsPlaying(false);
            setLoading(false);
            updateGlobalPlaybackState(false, false, false);
          }
        }, Math.min(loadTimeout + delay, 30000)); // Cap at 30 seconds
      };

      setupLoadTimeout();

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      audio.src = "";
      audio.load();

      const streamType = detectStreamType(url);
      configureAudioForStream(audio, streamType);

      if (streamType === 'hls' && Hls.isSupported()) {
        const hls = new Hls({
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
        
        hls.loadSource(url);
        hls.attachMedia(audio);
        hlsRef.current = hls;

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
                    if (hls && !hls.destroyed) {
                      hls.recoverMediaError();
                    }
                  }, backoffDelay);
                } else {
                  logger.error("Max HLS network retries reached. Stopping playback.");
                  setIsPlaying(false);
                  setLoading(false);
                  updateGlobalPlaybackState(false, false, false);
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                logger.warn(`HLS media error, retrying in ${backoffDelay}ms...`);
                if (loadRetryHandler.current.shouldRetry()) {
                  loadRetryHandler.current.incrementRetry();
                  setTimeout(() => {
                    if (hls && !hls.destroyed) {
                      hls.recoverMediaError();
                    }
                  }, backoffDelay);
                } else {
                  logger.error("Max HLS media retries reached. Stopping playbook.");
                  setIsPlaying(false);
                  setLoading(false);
                  updateGlobalPlaybackState(false, false, false);
                }
                break;
              default:
                logger.error("Fatal HLS error, destroying HLS instance.", data);
                hls.destroy();
                hlsRef.current = null;
                setIsPlaying(false);
                setLoading(false);
                updateGlobalPlaybackState(false, false, false);
                break;
            }
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          logger.debug("HLS manifest parsed, ready to play");
          setLoading(false);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          loadRetryHandler.current.reset();
        });

        hls.on(Hls.Events.FRAG_LOADED, () => {
          logger.debug("HLS fragment loaded");
          setLoading(false);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
        });

        // Add buffer events for better loading state management
        hls.on(Hls.Events.BUFFER_APPENDED, () => {
          setLoading(false);
        });

      } else {
        // Enhanced direct stream handling with retry mechanisms
        audio.src = url;
        audio.load();
        
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
            updateGlobalPlaybackState(false, false, false);
          }
        };
        
        const handleCanPlay = () => {
          logger.debug("Audio can play");
          setLoading(false);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
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

        // Enhanced error handling with stalled detection
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
      }
      
      lastUrlRef.current = url;
    }

    // Enhanced play/pause handling with retry logic
    if (isPlaying && audio.paused) {
      logger.debug("Starting playback with retry support...");
      attemptPlay(audio).catch(error => {
        logger.error("Failed to start playback after all retries:", error);
      });
    } else if (!isPlaying && !audio.paused) {
      logger.debug("Pausing playback...");
      audio.pause();
      updateGlobalPlaybackState(false, true, true);
      // Clear any pending play retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      playRetryHandler.current.reset();
    }
  }, [url, isPlaying, setIsPlaying, setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      // Clean up direct stream listeners
      const audio = globalAudioRef.element;
      if (audio && (audio as any)._directStreamCleanup) {
        (audio as any)._directStreamCleanup();
        (audio as any)._directStreamCleanup = null;
      }
    };
  }, []);
};
