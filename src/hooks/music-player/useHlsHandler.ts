
import { useRef, useEffect } from "react";
import Hls from "hls.js";

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

  useEffect(() => {
    if (!audioRef.current || !url) {
      return;
    }

    setLoading(true);
    
    // Clean up previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
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
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, isPlaying, setIsPlaying, setLoading]);

  return { hlsRef };
};
