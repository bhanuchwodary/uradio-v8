
import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Hls from "hls.js";

interface MusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

// Create a static audio reference to be shared across all instances
const globalAudioRef = {
  element: null as HTMLAudioElement | null,
  hls: null as Hls | null,
  activePlayerInstance: null as React.RefObject<symbol> | null
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
}) => {
  // Create a unique symbol to identify this player instance
  const playerInstanceRef = useRef(Symbol("player-instance"));
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Register this player instance when it mounts
  useEffect(() => {
    // If this is the first player or there's no active player, take control
    if (!globalAudioRef.activePlayerInstance) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
    
    return () => {
      // If this player was the active one, release control when unmounting
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        // Don't destroy the audio element, just release active status
        globalAudioRef.activePlayerInstance = null;
      }
    };
  }, []);

  // Create or reuse the audio element
  useEffect(() => {
    // Create a global audio element if it doesn't exist
    if (!globalAudioRef.element) {
      const audio = new Audio();
      // Set audio attributes for background playback
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.setAttribute('preload', 'auto');
      
      // Fix for TypeScript error - use type assertion for Mozilla-specific property
      if ('mozAudioChannelType' in audio) {
        (audio as any).mozAudioChannelType = 'content';
      }
      audio.volume = volume;
      
      globalAudioRef.element = audio;
    }
    
    const audio = globalAudioRef.element;
    
    const handleTimeUpdate = () => {
      // Only update time if this instance is active
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      // Only update duration if this instance is active
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setDuration(audio.duration);
        setLoading(false);
      }
    };
    
    const handleEnded = () => {
      // Only handle ended if this instance is active
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        handleNext();
      }
    };

    const handleCanPlay = () => {
      // Only update loading state if this instance is active
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setLoading(false);
      }
    };

    // When app goes to background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPlaying && audio && 
          globalAudioRef.activePlayerInstance === playerInstanceRef) {
        // Make sure playback continues when app is in background
        audio.play().catch(err => console.warn('Background play error:', err));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    
    // Prevent audio from stopping on mobile devices
    audio.addEventListener("pause", (e) => {
      // If we're still supposed to be playing but audio paused (e.g. by system)
      // Try to resume playback if it wasn't user-initiated and this instance is active
      if (isPlaying && !document.hasFocus() && 
          globalAudioRef.activePlayerInstance === playerInstanceRef) {
        audio.play().catch(err => console.warn('Resume error:', err));
      }
    });
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [isPlaying, volume]);

  // Take control of the player when this instance becomes active
  useEffect(() => {
    // When this component starts playing, take control from other instances
    if (isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
  }, [isPlaying]);

  const loadMedia = (url: string) => {
    if (!globalAudioRef.element) return;
    
    setLoading(true);
    
    // Take control of the player
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    // Destroy previous HLS instance if exists
    if (globalAudioRef.hls) {
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }
    
    const isHLS = url.includes('.m3u8');
    
    if (isHLS && Hls.isSupported()) {
      // Use HLS.js for m3u8 streams with optimized config for mobile
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000, // 60MB buffer for uninterrupted playback
      });
      
      hls.loadSource(url);
      hls.attachMedia(globalAudioRef.element);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying && globalAudioRef.activePlayerInstance === playerInstanceRef) {
          globalAudioRef.element?.play().catch(error => {
            console.error("Error playing HLS stream:", error);
            toast({
              title: "Playback Error",
              description: "Could not play this stream. Please try another URL.",
              variant: "destructive",
            });
            setIsPlaying(false);
            setLoading(false);
          });
        }
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal && globalAudioRef.activePlayerInstance === playerInstanceRef) {
          console.error("HLS fatal error:", data);
          toast({
            title: "Stream Error",
            description: "Error loading the stream. Please try another URL.",
            variant: "destructive",
          });
          setIsPlaying(false);
          setLoading(false);
          hls.destroy();
        }
      });
      
      globalAudioRef.hls = hls;
    } else {
      // Standard audio playback for other formats
      globalAudioRef.element.src = url;
      if (isPlaying && globalAudioRef.activePlayerInstance === playerInstanceRef) {
        globalAudioRef.element.play().catch(error => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback Error",
            description: "Could not play this track. Please try another URL.",
            variant: "destructive",
          });
          setIsPlaying(false);
          setLoading(false);
        });
      }
    }
  };

  useEffect(() => {
    // Only load media if this instance is active or becoming active
    if (urls.length > 0 && currentIndex >= 0 && currentIndex < urls.length && 
        (isPlaying || globalAudioRef.activePlayerInstance === playerInstanceRef)) {
      loadMedia(urls[currentIndex]);
    }
  }, [currentIndex, urls, isPlaying]);

  useEffect(() => {
    if (globalAudioRef.element && globalAudioRef.activePlayerInstance === playerInstanceRef) {
      if (isPlaying) {
        // Use promise to ensure we catch any autoplay restriction errors
        const playPromise = globalAudioRef.element.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            setLoading(false);
            
            // Try to enable audio context for mobile browsers
            if (typeof document !== 'undefined' && 'ontouchstart' in document.documentElement) {
              // iOS and some Android browsers require user interaction
              toast({
                title: "Audio Playback",
                description: "Tap the play button again to start playback",
                variant: "default",
              });
            }
          });
        }
      } else {
        globalAudioRef.element.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (globalAudioRef.element && globalAudioRef.activePlayerInstance === playerInstanceRef) {
      globalAudioRef.element.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    // Take control when manually playing
    if (!isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (urls.length > 0) {
      // Take control when changing tracks manually
      globalAudioRef.activePlayerInstance = playerInstanceRef;
      setCurrentIndex((currentIndex + 1) % urls.length);
    }
  };

  const handlePrevious = () => {
    if (urls.length > 0) {
      // Take control when changing tracks manually
      globalAudioRef.activePlayerInstance = playerInstanceRef;
      setCurrentIndex((currentIndex - 1 + urls.length) % urls.length);
    }
  };

  const handleSeek = (value: number[]) => {
    if (globalAudioRef.element && !isNaN(value[0]) && 
        globalAudioRef.activePlayerInstance === playerInstanceRef) {
      globalAudioRef.element.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Sync with actual audio state for UI when this player becomes active
  useEffect(() => {
    if (globalAudioRef.activePlayerInstance === playerInstanceRef && globalAudioRef.element) {
      setCurrentTime(globalAudioRef.element.currentTime);
      setDuration(globalAudioRef.element.duration);
    }
  }, [globalAudioRef.activePlayerInstance === playerInstanceRef]);

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/20 border-none shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3 className="font-bold text-lg truncate">
              {urls.length > 0 ? `Track ${currentIndex + 1}` : "No track selected"}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {urls[currentIndex] ? (new URL(urls[currentIndex])).hostname : "Add a URL to begin"}
            </p>
            {loading && (
              <p className="text-xs text-blue-400 animate-pulse mt-1">Loading stream...</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime || 0]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
              disabled={!duration || duration === Infinity}
            />
            <span className="text-xs">{formatTime(duration)}</span>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              disabled={urls.length === 0}
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-primary text-primary-foreground"
              onClick={handlePlayPause}
              disabled={urls.length === 0}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={urls.length === 0}
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            <Slider 
              value={[volume * 100]} 
              max={100}
              step={1}
              onValueChange={(values) => setVolume(values[0] / 100)}
              className="flex-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicPlayer;
