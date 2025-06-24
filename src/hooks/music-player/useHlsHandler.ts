
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

  // Initialize global audio element if it doesn't exist
  useEffect(() => {
    if (!globalAudioRef.element) {
      console.log("HLS Handler: Creating global audio element");
      globalAudioRef.element = new Audio();
      globalAudioRef.element.crossOrigin = "anonymous";
      globalAudioRef.element.preload = "auto";
    }
  }, []);

  useEffect(() => {
    const audio = globalAudioRef.element;

    console.log("HLS Handler: Effect triggered", { url, isPlaying, hasAudio: !!audio });

    if (!audio || !url) {
      if (audio) {
        audio.pause();
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
      console.log("HLS Handler: URL changed, reinitializing", { from: lastUrlRef.current, to: url });
      setLoading(true);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      audio.pause();
      audio.src = "";
      audio.load();

      const streamType = detectStreamType(url);
      configureAudioForStream(audio, streamType);

      if (streamType === 'hls' && Hls.isSupported()) {
        console.log("HLS Handler: Setting up HLS for", url);
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS Handler: Manifest parsed successfully");
          setLoading(false);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS Handler: Error occurred", data);
          if (data.fatal) {
            console.error("HLS Handler: Fatal error, stopping playback");
            setIsPlaying(false);
            setLoading(false);
          }
        });
      } else {
        console.log("HLS Handler: Setting up direct stream for", url);
        audio.src = url;
        
        const handleCanPlay = () => {
          console.log("HLS Handler: Direct stream ready");
          setLoading(false);
          audio.removeEventListener('canplay', handleCanPlay);
        };
        
        const handleError = () => {
          console.error("HLS Handler: Direct stream failed, trying CORS");
          handleDirectStreamError(audio, setIsPlaying, setLoading, url);
          audio.removeEventListener('error', handleError);
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.load();
      }
      
      lastUrlRef.current = url;
      retryCountRef.current = 0;
    }

    // Handle play/pause state changes
    const handlePlaybackState = async () => {
      console.log("HLS Handler: Handling playback state", { 
        isPlaying, 
        audioPaused: audio.paused,
        audioSrc: audio.src 
      });

      if (isPlaying && audio.paused && audio.src) {
        try {
          console.log("HLS Handler: Starting playback");
          await audio.play();
          console.log("HLS Handler: Playback started successfully");
          updateGlobalPlaybackState(true, false, false);
        } catch (error) {
          console.error("HLS Handler: Failed to start playback", error);
          setIsPlaying(false);
          updateGlobalPlaybackState(false, false, false);
        }
      } else if (!isPlaying && !audio.paused) {
        console.log("HLS Handler: Pausing playback");
        audio.pause();
        updateGlobalPlaybackState(false, true, true);
      }
    };

    handlePlaybackState();
  }, [url, isPlaying, setIsPlaying, setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);
};
