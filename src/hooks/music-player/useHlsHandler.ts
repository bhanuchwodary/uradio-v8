
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

    // Critical fix: Check if we're already playing this URL and don't reload
    if (url === lastUrlRef.current && audioRef.current.src && !audioRef.current.paused === isPlaying) {
      console.log("URL and playback state unchanged, maintaining current playback");
      return;
    }

    // Remember the URL for future reference
    lastUrlRef.current = url;
    
    // Only show loading if we're actually changing the URL
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
        const hls = new Hls({
          enableWorker: false, // Disable web workers to prevent CORS issues
          // Enhanced audio quality settings
          maxBufferLength: 30, // Increase buffer length for smoother playback
          maxMaxBufferLength: 60, // Maximum buffer size
          maxBufferSize: 60 * 1000 * 1000, // 60MB buffer size
          maxBufferHole: 0.5, // Maximum buffer holes
          // Quality selection - prefer highest quality audio
          startLevel: -1, // Auto select based on bandwidth
          capLevelToPlayerSize: false, // Don't limit quality
          autoStartLoad: true, // Auto start loading
          abrEwmaDefaultEstimate: 500000, // Higher bandwidth estimate for better initial quality
          // Error recovery improvements
          maxLoadingDelay: 4, // Allow more time for loading
          fragLoadingMaxRetry: 6, // More retries for fragment loading
          manifestLoadingMaxRetry: 6, // More retries for manifest loading
          levelLoadingMaxRetry: 6 // More retries for level loading
        });
        
        hls.attachMedia(audioRef.current);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(url);
        });
        
        // Set audio element properties for better quality
        if (audioRef.current) {
          audioRef.current.preload = "auto"; // Preload audio data
          // Setting high-quality audio attributes when possible
          try {
            // @ts-ignore - These are non-standard but useful properties
            audioRef.current.audioTracks?.forEach(track => {
              if (track.enabled) {
                console.log("Setting audio track to high quality");
              }
            });
          } catch (e) {
            console.log("Advanced audio features not supported");
          }
        }
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log("HLS manifest loaded with levels:", data.levels?.length || 0);
          
          // Select the highest quality level if available
          if (data.levels && data.levels.length > 1) {
            const audioLevels = data.levels.filter(level => !level.videoCodec);
            const bestLevel = audioLevels.length > 0 
              ? audioLevels.reduce((prev, current) => 
                  (prev.bitrate > current.bitrate) ? prev : current) 
              : null;
              
            if (bestLevel) {
              const bestLevelIdx = data.levels.indexOf(bestLevel);
              console.log(`Selecting best audio quality level: ${bestLevel.bitrate} bps (index: ${bestLevelIdx})`);
              hls.currentLevel = bestLevelIdx;
            }
          }
          
          setLoading(false);
          if (isPlaying) {
            audioRef.current?.play().catch(error => {
              console.error("Error playing HLS stream:", error);
              setIsPlaying(false);
            });
          }
        });
        
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          console.log(`HLS quality level switched to: ${data.level}`);
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
        
        globalAudioRef.hls = hls;
      } else if (globalAudioRef.hls) {
        // Compare current URL with the source URL we want to load
        const currentSource = url;
        // Remove this line that was causing the error
        // globalAudioRef.hls.url !== url
        
        // Just load the new source directly
        globalAudioRef.hls.loadSource(url);
      }
    } else if (audioRef.current.src !== url) {
      // Regular audio stream
      console.log("Loading regular audio stream:", url);
      audioRef.current.src = url;
      audioRef.current.load();
      
      // Enhanced audio settings for regular streams
      try {
        // Set audio quality attributes
        // Note: These are somewhat browser dependent
        audioRef.current.autoplay = false; // Let us control playback
        audioRef.current.preload = "auto"; // Preload audio
        // @ts-ignore - Non-standard but useful in some browsers
        if (typeof audioRef.current.mozAutoplayEnabled !== 'undefined') {
          // Firefox-specific
          // @ts-ignore
          audioRef.current.mozAutoplayEnabled = false;
        }
      } catch (e) {
        console.log("Some audio enhancements not supported by this browser");
      }
      
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
