
import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Track {
  url: string;
  name: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  onSkipNext,
  onSkipPrevious,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    audio.volume = volume;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(isNaN(audio.duration) ? 0 : audio.duration);
      setLoading(false);
    };
    
    const handleEnded = () => {
      onSkipNext();
    };

    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setLoading(false);
      toast({
        title: "Playback Error",
        description: "Could not play this audio stream. Please check the URL and try again.",
        variant: "destructive",
      });
      setIsPlaying(false);
    };
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError as EventListener);
    
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError as EventListener);
    };
  }, [onSkipNext, toast, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (tracks.length > 0 && currentIndex >= 0 && currentIndex < tracks.length) {
        setLoading(true);
        
        // Add a small timeout to ensure any previous operations are complete
        setTimeout(() => {
          if (!audioRef.current) return;
          
          // Force reload by setting src with cache-busting
          const url = tracks[currentIndex].url;
          audioRef.current.src = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
          
          // Set crossOrigin for CORS support
          audioRef.current.crossOrigin = "anonymous";
          
          // For stream URLs, don't wait for loadedmetadata as it might not fire
          if (url.includes('stream') || url.includes('radio')) {
            setDuration(0); // Streams don't have a fixed duration
          }
          
          if (isPlaying) {
            audioRef.current.load();
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.error("Error playing audio:", error);
                setIsPlaying(false);
                setLoading(false);
                toast({
                  title: "Playback Error",
                  description: "Could not play this track. Please try again or use another URL.",
                  variant: "destructive",
                });
              });
            }
          }
        }, 100);
      }
    }
  }, [currentIndex, tracks, isPlaying, toast, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && !isNaN(value[0]) && isFinite(value[0])) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const currentTrack = tracks[currentIndex];
  const trackName = currentTrack ? currentTrack.name : "No track selected";
  const trackUrl = currentTrack ? currentTrack.url : "";
  const isStreamUrl = trackUrl.includes('stream') || trackUrl.includes('radio');

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-white/20 border-none shadow-lg">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h3 className="font-bold text-lg truncate">
              {loading ? "Loading..." : trackName}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {trackUrl ? (trackUrl.startsWith('http') ? new URL(trackUrl).hostname : trackUrl) : "Add a URL to begin"}
              {isStreamUrl && " (Live Stream)"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={[isNaN(currentTime) || !isFinite(currentTime) ? 0 : currentTime]}
              max={isNaN(duration) || !isFinite(duration) || duration === 0 ? 100 : duration}
              step={1}
              onValueChange={handleSeek}
              disabled={isStreamUrl || loading}
              className={`flex-1 ${isStreamUrl ? "opacity-50" : ""}`}
            />
            <span className="text-xs">{isStreamUrl ? "LIVE" : formatTime(duration)}</span>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkipPrevious}
              disabled={tracks.length === 0 || loading}
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isPlaying ? "bg-red-500" : "bg-primary"} text-primary-foreground`}
              onClick={handlePlayPause}
              disabled={tracks.length === 0 || loading}
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
              onClick={onSkipNext}
              disabled={tracks.length === 0 || loading}
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
