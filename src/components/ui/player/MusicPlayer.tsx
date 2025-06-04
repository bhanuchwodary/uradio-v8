
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/track";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";
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

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-900/70 backdrop-blur-xl border-0 shadow-2xl">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm"></div>
      
      <div className="relative z-10 p-6">
        <div className="flex flex-col space-y-6">
          {/* Enhanced Station info with visual elements */}
          <div className="text-center px-4">
            <div className="mb-4 flex justify-center">
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500",
                isPlaying 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse shadow-blue-500/30" 
                  : "bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700"
              )}>
                <div className="text-white text-2xl font-bold">
                  {currentTrack?.name ? currentTrack.name.charAt(0).toUpperCase() : "?"}
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent leading-tight mb-2">
              {currentTrack?.name || "Select a station"}
            </h2>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mb-3 font-medium">
              {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
            </p>
            
            {currentTrack?.language && (
              <div className="flex items-center justify-center mb-3">
                <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-700 shadow-sm">
                  {currentTrack.language}
                </span>
              </div>
            )}
            
            {loading && (
              <div className="flex items-center justify-center gap-2 text-blue-500 animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                <span className="text-sm font-medium ml-2">Loading stream...</span>
              </div>
            )}
          </div>

          {/* Enhanced Controls */}
          <div className="flex items-center justify-center space-x-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              disabled={!currentTrack}
              className="h-14 w-14 rounded-2xl bg-white/50 dark:bg-black/30 hover:bg-white/70 dark:hover:bg-black/50 shadow-lg ios-touch-target active:scale-95 transition-all duration-200 backdrop-blur-sm border border-white/30 dark:border-white/10"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={onPlayPause}
              disabled={!currentTrack}
              className={cn(
                "h-20 w-20 rounded-3xl ios-touch-target active:scale-95 transition-all duration-300 shadow-2xl border-4 border-white/30",
                isPlaying 
                  ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-500/30" 
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/30"
              )}
            >
              {isPlaying ? (
                <Pause className="h-10 w-10" />
              ) : (
                <Play className="h-10 w-10 ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={!currentTrack}
              className="h-14 w-14 rounded-2xl bg-white/50 dark:bg-black/30 hover:bg-white/70 dark:hover:bg-black/50 shadow-lg ios-touch-target active:scale-95 transition-all duration-200 backdrop-blur-sm border border-white/30 dark:border-white/10"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* Enhanced Volume control */}
          <div className="bg-white/30 dark:bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/30 dark:border-white/10">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Volume2 className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div className="flex-1 py-2">
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(values) => onVolumeChange(values[0] / 100)}
                  className="flex-1"
                />
              </div>
              <div className="flex-shrink-0 text-sm font-medium text-slate-600 dark:text-slate-300 min-w-[3rem] text-right">
                {Math.round(volume * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
