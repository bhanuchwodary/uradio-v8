
import { useRef, useEffect } from "react";
import Hls from "hls.js";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { createHlsInstance, handleHlsError, selectBestAudioQuality } from "./hls-utils/hlsStreamHandler";
import { configureStandardAudio } from "./hls-utils/audioConfig";

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

    // Check if we're already playing this URL and don't reload
    if (url === lastUrlRef.current && audioRef.current.src && !audioRef.current.paused === isPlaying) {
      console.log("URL and playback state unchanged, maintaining current playback");
      return;
    }

    // Remember the URL for future reference
    lastUrlRef.current = url;
    
    // Only show loading if we're changing the URL
    if (audioRef.current.src !== url) {
      setLoading(true);
    }
    
    // Clean up previous HLS instance if exists and if URL has changed
    if (globalAudioRef.hls && audioRef.current.src !== url) {
      console.log("Destroying previous HLS instance");
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }

    // Check if the URL is an HLS stream
    if (url.includes('.m3u8') && Hls.isSupported()) {
      console.log("Loading HLS stream:", url);
      
      // Only create a new HLS instance if needed
      if (!globalAudioRef.hls) {
        const hls = createHlsInstance(
          audioRef.current,
          url,
          // Manifest parsed handler
          (event, data) => {
            console.log("HLS manifest loaded with levels:", data.levels?.length || 0);
            selectBestAudioQuality(hls, data);
            setLoading(false);
            
            if (isPlaying) {
              audioRef.current?.play().catch(error => {
                console.error("Error playing HLS stream:", error);
                setIsPlaying(false);
              });
            }
          },
          // Error handler
          (event, data) => {
            handleHlsError(
              hls, 
              data,
              () => {
                setIsPlaying(false);
                setLoading(false);
              },
              url,
              audioRef.current || undefined
            );
          }
        );
        
        globalAudioRef.hls = hls;
      } else if (globalAudioRef.hls) {
        // Just load the new source directly
        globalAudioRef.hls.loadSource(url);
      }
    } else if (audioRef.current.src !== url) {
      // Regular audio stream
      console.log("Loading regular audio stream:", url);
      audioRef.current.src = url;
      audioRef.current.load();
      
      // Configure standard audio for regular streams
      configureStandardAudio(audioRef.current);
      
      // Error handling for regular streams
      audioRef.current.onerror = (e) => {
        console.error("Audio stream error:", e);
        setLoading(false);
        setIsPlaying(false);
        
        // Try to recover by reloading the stream
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
          }
        }, 2000);
      };
      
      // Wait for canplay event to clear loading
      audioRef.current.oncanplay = () => {
        setLoading(false);
        if (isPlaying) {
          audioRef.current?.play().catch(error => {
            console.error("Error playing audio stream:", error);
            setIsPlaying(false);
          });
        }
      };
    } else {
      // URL is the same, just sync playback state
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error resuming audio stream:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
      setLoading(false);
    }

    return () => {
      // Don't destroy HLS instance on component unmount to maintain playback
      // The global HLS instance will be cleaned up when we load a new URL
    };
  }, [url, isPlaying, audioRef, setIsPlaying, setLoading]);

  return { hlsRef };
};
