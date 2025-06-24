
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef, updateGlobalPlaybackState } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { detectStreamType, configureAudioForStream, handleDirectStreamError } from "@/utils/streamHandler";

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
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  useEffect(() => {
    const audio = globalAudioRef.element;

    if (!audio || !url) {
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
      return;
    }

    // Only re-configure HLS or change source if URL actually changed
    if (url !== lastUrlRef.current) {
      logger.debug(`URL changed from ${lastUrlRef.current} to ${url}. Re-initializing HLS.`);
      setLoading(true);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      audio.src = "";
      audio.load();

      const streamType = detectStreamType(url);
      configureAudioForStream(audio, streamType);

      if (streamType === 'hls' && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(audio);
        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          logger.error("HLS Error:", data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                logger.warn("HLS network error, attempting to recover...");
                if (retryCountRef.current < maxRetries) {
                  retryCountRef.current++;
                  hls.recoverMediaError();
                } else {
                  logger.error("Max HLS network retries reached. Stopping playback.");
                  setIsPlaying(false);
                  setLoading(false);
                  audio.pause();
                  audio.src = "";
                  updateGlobalPlaybackState(false, false, false);
                }
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                logger.warn("HLS media error, attempting to recover...");
                if (retryCountRef.current < maxRetries) {
                  retryCountRef.current++;
                  hls.recoverMediaError();
                } else {
                  logger.error("Max HLS media retries reached. Stopping playback.");
                  setIsPlaying(false);
                  setLoading(false);
                  audio.pause();
                  audio.src = "";
                  updateGlobalPlaybackState(false, false, false);
                }
                break;
              default:
                logger.error("Fatal HLS error, destroying HLS instance.", data);
                hls.destroy();
                hlsRef.current = null;
                setIsPlaying(false);
                setLoading(false);
                audio.pause();
                audio.src = "";
                updateGlobalPlaybackState(false, false, false);
                break;
            }
          }
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          logger.debug("HLS manifest parsed.");
          setLoading(false);
        });
      } else {
        // Direct playback for non-HLS or if HLS is not supported
        audio.src = url;
        audio.load();
        audio.addEventListener('error', () => handleDirectStreamError(audio, setIsPlaying, setLoading, url), { once: true });
        audio.addEventListener('canplay', () => setLoading(false), { once: true });
      }
      lastUrlRef.current = url;
      retryCountRef.current = 0;
    }

    // CONTROL PLAY/PAUSE BASED ON 'isPlaying' PROP AND GLOBAL STATE
    if (isPlaying && audio.paused) {
        audio.play().then(() => {
            logger.debug("Playback started (from useHlsHandler).");
            setIsPlaying(true);
            updateGlobalPlaybackState(true, false, false);
        }).catch(error => {
            logger.error("Error attempting to play stream (from useHlsHandler):", error);
            setIsPlaying(false);
            updateGlobalPlaybackState(false, false, false);
        });
    } else if (!isPlaying && !audio.paused) {
        logger.debug("Playback paused (from useHlsHandler).");
        audio.pause();
        updateGlobalPlaybackState(false, false, false);
    }
  }, [url, isPlaying, setIsPlaying, setLoading]);
};
