
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef, updateGlobalPlaybackState } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { detectStreamType, configureAudioForStream } from "@/utils/streamHandler";
import { useRetryManager } from "./useRetryManager";
import { useAudioPlayback } from "./useAudioPlayback";
import { useHlsConfiguration } from "./useHlsConfiguration";
import { useDirectStreamHandler } from "./useDirectStreamHandler";

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

  const {
    loadRetryHandler,
    playRetryHandler,
    loadTimeoutRef,
    retryTimeoutRef,
    clearTimeouts,
    resetRetryHandlers,
    setupLoadTimeout,
  } = useRetryManager();

  const { attemptPlay } = useAudioPlayback({
    setIsPlaying,
    setLoading,
    playRetryHandler,
    retryTimeoutRef
  });

  const clearLoadTimeout = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  const { createHlsInstance, setupHlsEventHandlers } = useHlsConfiguration({
    setLoading,
    setIsPlaying,
    loadRetryHandler,
    clearLoadTimeout
  });

  const { setupDirectStreamHandlers } = useDirectStreamHandler({
    setIsPlaying,
    setLoading,
    loadRetryHandler,
    clearLoadTimeout
  });

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
      clearTimeouts();
      return;
    }

    // Only re-configure HLS or change source if URL actually changed
    if (url !== lastUrlRef.current) {
      logger.debug(`URL changed from ${lastUrlRef.current} to ${url}. Re-initializing stream.`);
      setLoading(true);

      clearTimeouts();
      resetRetryHandlers();

      // Set up load timeout with retry logic
      const handleLoadTimeout = () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        audio.src = "";
        audio.load();
      };

      setupLoadTimeout(() => {
        handleLoadTimeout();
        if (!loadRetryHandler.current.shouldRetry()) {
          setIsPlaying(false);
          setLoading(false);
          updateGlobalPlaybackState(false, false, false);
        }
      });

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      audio.src = "";
      audio.load();

      const streamType = detectStreamType(url);
      configureAudioForStream(audio, streamType);

      if (streamType === 'hls' && Hls.isSupported()) {
        const hls = createHlsInstance();
        
        hls.loadSource(url);
        hls.attachMedia(audio);
        hlsRef.current = hls;

        setupHlsEventHandlers(hls, hlsRef);
      } else {
        // Enhanced direct stream handling with retry mechanisms
        audio.src = url;
        audio.load();
        
        setupDirectStreamHandlers(audio, url);
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
  }, [url, isPlaying, setIsPlaying, setLoading, attemptPlay, createHlsInstance, setupHlsEventHandlers, setupDirectStreamHandlers, clearTimeouts, resetRetryHandlers, setupLoadTimeout, loadRetryHandler, playRetryHandler, retryTimeoutRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      clearTimeouts();
      // Clean up direct stream listeners
      const audio = globalAudioRef.element;
      if (audio && (audio as any)._directStreamCleanup) {
        (audio as any)._directStreamCleanup();
        (audio as any)._directStreamCleanup = null;
      }
    };
  }, [clearTimeouts]);
};
