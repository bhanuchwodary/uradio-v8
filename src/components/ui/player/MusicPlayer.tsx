
import React from "react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/track";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  loading?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  loading = false
}) => {
  const getHostnameFromUrl = (url: string): string => {
    if (!url) return "No URL";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return "Invalid URL";
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-background/80 to-background border-none shadow-lg backdrop-blur-md">
      <div className="flex flex-col space-y-4">
        {/* Station info */}
        <div className="text-center">
          <h2 className="text-xl font-bold truncate">
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {loading && (
            <p className="text-xs text-blue-400 animate-pulse mt-1">Loading stream...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-10 w-10 rounded-full"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className={cn(
              "h-12 w-12 rounded-full",
              isPlaying ? "bg-primary/90" : "bg-primary"
            )}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-10 w-10 rounded-full"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(values) => onVolumeChange(values[0] / 100)}
            className="flex-1"
          />
        </div>
      </div>
    </Card>
  );
};
