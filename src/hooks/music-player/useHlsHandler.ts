
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef } from "@/components/music-player/audioInstance";

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

  useEffect(() => {
    if (!audioRef.current || !url) {
      return;
    }

    // Skip if URL hasn't changed and audio is already set up
    if (url === lastUrlRef.current && globalAudioRef.isInitialized) {
      console.log("URL hasn't changed, maintaining current playback");
      return;
    }

    // Remember the URL for future reference
    lastUrlRef.current = url;
    
    setLoading(true);
    
    // Clean up previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    if (globalAudioRef.hls) {
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }

    // Check if the URL is an HLS stream
    if (url.includes('.m3u8') && Hls.isSupported()) {
      console.log("Loading HLS stream:", url);
      
      const hls = new Hls({
        enableWorker: false, // Disable web workers to prevent CORS issues
      });
      
      hls.attachMedia(audioRef.current);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded");
        setLoading(false);
        if (isPlaying) {
          audioRef.current?.play().catch(error => {
            console.error("Error playing HLS stream:", error);
            setIsPlaying(false);
          });
        }
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, attempting to recover");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, attempting to recover");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable HLS error");
              setIsPlaying(false);
              setLoading(false);
              break;
          }
        }
      });
      
      hlsRef.current = hls;
      globalAudioRef.hls = hls;
    } else {
      // Regular audio stream
      console.log("Loading regular audio stream:", url);
      audioRef.current.src = url;
      audioRef.current.load();
      setLoading(false);
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio stream:", error);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      // Don't destroy HLS instance on component unmount to maintain playback
      // The global HLS instance will be cleaned up when we load a new URL
    };
  }, [url, isPlaying, setIsPlaying, setLoading]);

  return { hlsRef };
};
