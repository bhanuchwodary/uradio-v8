
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { Track } from "@/types/track";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { useMediaSession } from "@/hooks/useMediaSession";

interface UseMusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  tracks?: Track[];
}

export const useMusicPlayer = (props?: UseMusicPlayerProps) => {
  // If we don't have props, provide default values
  const {
    urls = [],
    currentIndex = 0,
    setCurrentIndex = () => {},
    isPlaying = false,
    setIsPlaying = () => {},
    tracks = [],
  } = props || {};

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [loading, setLoading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const intervalRef = useRef<number | null>(null);
  const playerInstanceRef = useRef<symbol>(Symbol("playerInstance"));

  // Handle next track
  const handleNext = () => {
    // Using a direct number instead of a callback function
    if (urls.length === 0) return;
    const nextIndex = (currentIndex + 1) % urls.length;
    setCurrentIndex(nextIndex);
  };

  // Handle previous track
  const handlePrevious = () => {
    // Using a direct number instead of a callback function
    if (urls.length === 0) return;
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    setCurrentIndex(prevIndex);
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current && !isNaN(value[0])) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  // Set up media session API
  useMediaSession({
    tracks,
    currentIndex,
    isPlaying,
    trackDuration: duration,
    trackPosition: currentTime,
    setIsPlaying,
    onSkipNext: handleNext,
    onSkipPrevious: handlePrevious,
    onSeek: (position) => {
      handleSeek([position]);
    },
  });

  // Initialize audio element and HLS.js if needed
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!globalAudioRef.element) {
      globalAudioRef.element = new Audio();
      globalAudioRef.element.preload = "auto";
      globalAudioRef.element.crossOrigin = "anonymous";
    }

    audioRef.current = globalAudioRef.element;
    
    // Set this instance as the active instance
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    // Set initial volume
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    return () => {
      // Clean up if this instance is the active one
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Don't destroy the audio element as it might be used by another instance
      }
    };
  }, []);

  // Handle URL changes
  useEffect(() => {
    // Only proceed if this instance is the active one
    if (globalAudioRef.activePlayerInstance !== playerInstanceRef) {
      return;
    }

    const loadURL = async () => {
      if (!audioRef.current || !urls.length || currentIndex >= urls.length) {
        return;
      }

      const url = urls[currentIndex];
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
    };

    loadURL();
  }, [urls, currentIndex, isPlaying]);

  // Set up event listeners for the audio element
  useEffect(() => {
    if (!audioRef.current || globalAudioRef.activePlayerInstance !== playerInstanceRef) {
      return;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setLoading(false);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleWaiting = () => {
      setLoading(true);
    };

    // Add event listeners
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);

    // Set up interval to update time more frequently for smoother progress bar
    intervalRef.current = window.setInterval(() => {
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
      }
    }, 500);

    return () => {
      // Remove event listeners
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);

      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [urls, currentIndex]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current || globalAudioRef.activePlayerInstance !== playerInstanceRef) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return {
    duration,
    currentTime,
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    // Include these properties for compatibility with existing code
    urls,
    tracks,
    removeUrl: (index: number) => console.warn("removeUrl not implemented"),
    editTrack: (index: number, data: { url: string; name: string }) => 
      console.warn("editTrack not implemented"),
  };
};
