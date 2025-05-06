
import React from "react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/track";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

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
    <Card className={cn(
      "p-5 border-none shadow-lg",
      isDark 
        ? "bg-gradient-to-br from-background/70 to-background/40" 
        : "bg-gradient-to-br from-white/70 to-background/40"
    )}>
      <div className="flex flex-col space-y-5">
        {/* Station info */}
        <div className="text-center">
          <h2 className={cn(
            "text-2xl font-bold truncate",
            isPlaying && "text-primary"
          )}>
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-sm text-muted-foreground truncate mt-1">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {loading && (
            <p className="text-sm text-accent animate-pulse mt-2 font-medium">Loading stream...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-12 w-12 rounded-full transition-all hover:bg-background/50"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            variant={isPlaying ? "outline" : "default"}
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className={cn(
              "h-16 w-16 rounded-full transition-all shadow-md",
              isPlaying 
                ? "bg-background/50 border-primary text-primary hover:text-primary hover:bg-background/70" 
                : "bg-primary hover:bg-primary/90"
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
            className="h-12 w-12 rounded-full transition-all hover:bg-background/50"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3 px-2 pt-1">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(values) => onVolumeChange(values[0] / 100)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </Card>
  );
};
