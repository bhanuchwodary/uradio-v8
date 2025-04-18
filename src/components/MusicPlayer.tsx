
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
  tracks?: { name: string; url: string }[];
}

// Move globalAudioRef outside of the component to maintain state between route changes
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
  tracks = [],
}) => {
  // Create a unique identifier for this player instance
  const playerInstanceRef = useRef(Symbol("player-instance"));
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Handle visibility change to resume playback when tab becomes active
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && isPlaying && 
        globalAudioRef.activePlayerInstance === playerInstanceRef && 
        globalAudioRef.element && globalAudioRef.element.paused) {
      globalAudioRef.element.play().catch(err => console.warn('Resume error:', err));
    }
  };

  useEffect(() => {
    // Register this instance if no active instance exists
    if (!globalAudioRef.activePlayerInstance) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
    
    return () => {
      // Only clear the active instance if this component was the active one
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        // Don't set to null when navigating between routes to maintain playback
        // Instead we'll let the new instance pick up the playback
      }
    };
  }, []);

  useEffect(() => {
    // Initialize audio element if it doesn't exist
    if (!globalAudioRef.element) {
      const audio = new Audio();
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.setAttribute('preload', 'auto');
      
      if ('mozAudioChannelType' in audio) {
        (audio as any).mozAudioChannelType = 'content';
      }
      audio.volume = volume;
      
      globalAudioRef.element = audio;
    }
    
    const audio = globalAudioRef.element;
    
    const handleTimeUpdate = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setCurrentTime(audio.currentTime);
      }
    };
    
    const handleLoadedMetadata = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setDuration(audio.duration);
        setLoading(false);
      }
    };
    
    const handleEnded = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        handleNext();
      }
    };

    const handleCanPlay = () => {
      if (globalAudioRef.activePlayerInstance === playerInstanceRef) {
        setLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);
    
    audio.addEventListener("pause", (e) => {
      if (isPlaying && !document.hasFocus() && 
          globalAudioRef.activePlayerInstance === playerInstanceRef) {
        audio.play().catch(err => console.warn('Resume error:', err));
      }
    });
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [isPlaying, volume]);

  // Set this instance as active when playing
  useEffect(() => {
    if (isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
  }, [isPlaying]);

  // Use effect to sync with current time on component mount or when becoming active
  useEffect(() => {
    if (globalAudioRef.activePlayerInstance === playerInstanceRef && globalAudioRef.element) {
      setCurrentTime(globalAudioRef.element.currentTime);
      setDuration(globalAudioRef.element.duration || 0);
      setVolume(globalAudioRef.element.volume);
    }
  }, []);

  // Load media function
  const loadMedia = (url: string) => {
    if (!globalAudioRef.element) return;
    
    setLoading(true);
    
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    if (globalAudioRef.hls) {
      globalAudioRef.hls.destroy();
      globalAudioRef.hls = null;
    }
    
    const isHLS = url.includes('.m3u8');
    
    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
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

  // Handle changes to current track
  useEffect(() => {
    if (urls.length > 0 && currentIndex >= 0 && currentIndex < urls.length && 
        (isPlaying || globalAudioRef.activePlayerInstance === playerInstanceRef)) {
      loadMedia(urls[currentIndex]);
    }
  }, [currentIndex, urls, isPlaying]);

  // Handle play/pause state changes
  useEffect(() => {
    if (globalAudioRef.element && globalAudioRef.activePlayerInstance === playerInstanceRef) {
      if (isPlaying) {
        const playPromise = globalAudioRef.element.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
            setLoading(false);
            
            if (typeof document !== 'undefined' && 'ontouchstart' in document.documentElement) {
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

  // Handle volume changes
  useEffect(() => {
    if (globalAudioRef.element && globalAudioRef.activePlayerInstance === playerInstanceRef) {
      globalAudioRef.element.volume = volume;
    }
  }, [volume]);

  // Player control handlers
  const handlePlayPause = () => {
    if (!isPlaying) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (urls.length > 0) {
      globalAudioRef.activePlayerInstance = playerInstanceRef;
      setCurrentIndex((currentIndex + 1) % urls.length);
    }
  };

  const handlePrevious = () => {
    if (urls.length > 0) {
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

  // Sync with global audio element's current time and duration
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
              {tracks[currentIndex]?.name || `Track ${currentIndex + 1}`}
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
