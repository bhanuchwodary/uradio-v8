
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

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Create a new audio element if it doesn't exist
    if (!audioRef.current) {
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
      
      audioRef.current = audio;
    }
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    
    const handleEnded = () => {
      handleNext();
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    // When app goes to background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPlaying && audio) {
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
      // Try to resume playback if it wasn't user-initiated
      if (isPlaying && !document.hasFocus()) {
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

  const loadMedia = (url: string) => {
    if (!audioRef.current) return;
    
    setLoading(true);
    
    // Destroy previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
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
      hls.attachMedia(audioRef.current);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          audioRef.current?.play().catch(error => {
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
        if (data.fatal) {
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
      
      hlsRef.current = hls;
    } else {
      // Standard audio playback for other formats
      audioRef.current.src = url;
      if (isPlaying) {
        audioRef.current.play().catch(error => {
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
    if (urls.length > 0 && currentIndex >= 0 && currentIndex < urls.length) {
      loadMedia(urls[currentIndex]);
    }
  }, [currentIndex, urls]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Use promise to ensure we catch any autoplay restriction errors
        const playPromise = audioRef.current.play();
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
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (urls.length > 0) {
      setCurrentIndex((currentIndex + 1) % urls.length);
    }
  };

  const handlePrevious = () => {
    if (urls.length > 0) {
      setCurrentIndex((currentIndex - 1 + urls.length) % urls.length);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && !isNaN(value[0])) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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
