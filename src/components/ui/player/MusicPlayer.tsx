
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
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={!currentTrack}
          className="h-9 w-9 rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onPlayPause}
          disabled={!currentTrack}
          className="h-10 w-10 rounded-full bg-primary text-on-primary hover:bg-primary/90"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={!currentTrack}
          className="h-9 w-9 rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Redesigned full player layout for non-compact mode
  return (
    <Card className="p-4 bg-surface-container-low border border-outline-variant/30 shadow-xl shadow-black/5 rounded-3xl animate-scale-in">
      <div className="flex flex-col space-y-4">
        {/* Station info */}
        <div className="text-center px-2">
          <h2 className="text-xl font-bold truncate leading-tight text-on-surface">
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-sm text-on-surface-variant truncate mt-1">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {currentTrack?.language && (
            <div className="flex items-center justify-center text-xs mt-2">
              <span className="bg-primary/15 text-primary px-2 py-1 rounded-full">{currentTrack.language}</span>
            </div>
          )}
          {loading && (
            <p className="text-sm text-primary animate-pulse mt-2">Loading...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-14 w-14 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className={`h-20 w-20 rounded-full shadow-lg active:scale-95 transition-transform duration-200 ${isPlaying ? "animate-pulse" : ""}`}
          >
            {isPlaying ? (
              <Pause className="h-9 w-9" />
            ) : (
              <Play className="h-9 w-9 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-14 w-14 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3 px-2">
          <Volume2 className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
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
