
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/track";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { saveVolumePreference } from "@/utils/volumeStorage";

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  loading?: boolean;
  compact?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  loading = false,
  compact = false
}) => {
  // Save volume preference whenever it changes
  useEffect(() => {
    saveVolumePreference(volume);
  }, [volume]);

  const getHostnameFromUrl = (url: string): string => {
    if (!url) return "No URL";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return "Invalid URL";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-4 bg-transparent">
        {/* Station info - compact */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-sm sm:text-base font-semibold truncate leading-tight">
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {loading && (
            <p className="text-xs text-blue-400 animate-pulse">Loading...</p>
          )}
        </div>

        {/* Controls - horizontal compact */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-accent/60 hover:bg-accent/80 dark:bg-gray-800/60 dark:hover:bg-gray-700/80 transition-all active:scale-95"
          >
            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary hover:bg-primary/90 transition-all active:scale-95"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-accent/60 hover:bg-accent/80 dark:bg-gray-800/60 dark:hover:bg-gray-700/80 transition-all active:scale-95"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Volume control - vertical compact */}
        <div className="hidden md:flex items-center space-x-2 w-24 lg:w-32">
          <Volume2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(values) => onVolumeChange(values[0] / 100)}
            className="flex-1"
          />
        </div>
      </div>
    );
  }

  // Original full player layout for non-compact mode
  return (
    <Card className="p-4 bg-gradient-to-br from-background/80 to-background border-none shadow-lg backdrop-blur-md">
      <div className="flex flex-col space-y-4">
        {/* Station info */}
        <div className="text-center px-2">
          <h2 className="text-xl font-bold truncate leading-tight">
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {currentTrack?.language && (
            <div className="flex items-center justify-center text-xs text-blue-400 mt-2">
              <span className="bg-blue-500/10 px-2 py-1 rounded-full">{currentTrack.language}</span>
            </div>
          )}
          {loading && (
            <p className="text-xs text-blue-400 animate-pulse mt-2">Loading stream...</p>
          )}
        </div>

        {/* Controls - iOS optimized */}
        <div className="flex items-center justify-center space-x-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-12 w-12 rounded-full bg-accent hover:bg-accent/80 dark:bg-gray-800 dark:hover:bg-gray-700 ios-touch-target active:scale-95 transition-transform"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className={cn(
              "h-16 w-16 rounded-full ios-touch-target active:scale-95 transition-transform",
              isPlaying ? "bg-primary/90" : "bg-primary"
            )}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-12 w-12 rounded-full bg-accent hover:bg-accent/80 dark:bg-gray-800 dark:hover:bg-gray-700 ios-touch-target active:scale-95 transition-transform"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume control - iOS optimized */}
        <div className="flex items-center space-x-3 px-2">
          <Volume2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 py-2">
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
