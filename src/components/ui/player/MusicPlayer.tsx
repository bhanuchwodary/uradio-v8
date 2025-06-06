
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

  // Generate audio levels for visualization
  const [audioLevels, setAudioLevels] = React.useState<number[]>([0, 0, 0, 0, 0]);
  
  useEffect(() => {
    if (!isPlaying) {
      setAudioLevels([0, 0, 0, 0, 0]);
      return;
    }
    
    const interval = setInterval(() => {
      setAudioLevels([
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2
      ]);
    }, 180);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (compact) {
    return (
      <div className="flex items-center w-full py-1 px-1">
        {/* Controls - left side */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-8 w-8 rounded-full bg-accent/60 hover:bg-accent/80 dark:bg-gray-800/60 dark:hover:bg-gray-700/80 transition-all active:scale-95"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 transition-all active:scale-95"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-8 w-8 rounded-full bg-accent/60 hover:bg-accent/80 dark:bg-gray-800/60 dark:hover:bg-gray-700/80 transition-all active:scale-95"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Station info with audio visualization - center */}
        <div className="flex-1 min-w-0 px-2 sm:px-4 flex justify-center items-center">
          <div className="w-full relative">
            <h2 className="text-sm font-medium text-center truncate leading-tight text-foreground">
              {currentTrack?.name || "Select a station"}
            </h2>
            
            {/* Visualization in compact mode */}
            {isPlaying && (
              <div className="absolute -bottom-3 left-0 right-0 flex justify-center items-end gap-[3px] h-2">
                {audioLevels.map((level, i) => (
                  <div 
                    key={i}
                    className="w-1 bg-primary/80 rounded-t-sm transition-all duration-150 ease-out"
                    style={{ height: `${level * 100}%` }}
                  />
                ))}
              </div>
            )}
            
            {loading && (
              <p className="text-xs text-center text-blue-400 animate-pulse">Loading...</p>
            )}
          </div>
        </div>

        {/* Volume control - right side */}
        <div className="hidden md:flex items-center space-x-2 w-24">
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

  // Original full player layout for non-compact mode with added visualization
  return (
    <Card className="p-4 bg-gradient-to-br from-background/80 to-background/90 backdrop-blur-md border-none shadow-lg">
      <div className="flex flex-col space-y-4">
        {/* Station info with visualization backdrop */}
        <div className="text-center px-2 relative">
          {/* Audio visualization behind station name */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-end gap-1 h-8 opacity-30">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className={`w-1.5 bg-primary rounded-t-md transition-all duration-150 ease-out ${!isPlaying ? 'h-1' : ''}`}
                style={isPlaying ? { 
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.1}s`
                } : {}}
              />
            ))}
          </div>
          
          <h2 className="text-xl font-bold truncate leading-tight relative z-10">
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-xs text-muted-foreground truncate mt-1 relative z-10">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {currentTrack?.language && (
            <div className="flex items-center justify-center text-xs text-blue-400 mt-2 relative z-10">
              <span className="bg-blue-500/10 px-2 py-1 rounded-full">{currentTrack.language}</span>
            </div>
          )}
          {loading && (
            <p className="text-xs text-blue-400 animate-pulse mt-2 relative z-10">Loading stream...</p>
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
