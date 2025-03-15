
import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const { toast } = useToast();

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    audio.volume = volume;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      handleNext();
    };
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (urls.length > 0 && currentIndex >= 0 && currentIndex < urls.length) {
        audioRef.current.src = urls[currentIndex];
        if (isPlaying) {
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            toast({
              title: "Playback Error",
              description: "Could not play this track. Please try another URL.",
              variant: "destructive",
            });
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentIndex, urls]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
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
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
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
              {urls[currentIndex] ? new URL(urls[currentIndex]).hostname : "Add a URL to begin"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
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
