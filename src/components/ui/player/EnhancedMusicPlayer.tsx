
import React from "react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/track";
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EnhancedMusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  loading?: boolean;
  onToggleFavorite?: () => void;
}

export const EnhancedMusicPlayer: React.FC<EnhancedMusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  loading = false,
  onToggleFavorite
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

  // Animated dots for loading state
  const LoadingDots = () => (
    <div className="flex space-x-1 items-center justify-center">
      {[1, 2, 3].map((_, index) => (
        <motion.div
          key={index}
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="p-6 bg-gradient-to-br from-background/80 to-background/40 border-none shadow-lg backdrop-blur-md overflow-hidden">
        <div className="flex flex-col space-y-6">
          {/* Album art or placeholder */}
          <div className="flex justify-center">
            <motion.div 
              className={cn(
                "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center material-shadow-2",
                isPlaying ? "bg-primary/20" : "bg-secondary/40"
              )}
              animate={{ 
                rotate: isPlaying ? 360 : 0,
                scale: isPlaying ? [1, 1.02, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {currentTrack ? (
                <span className="text-4xl md:text-5xl text-primary font-bold">
                  {currentTrack.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="text-4xl md:text-5xl text-muted-foreground">?</span>
              )}
            </motion.div>
          </div>
          
          {/* Station info */}
          <div className="text-center">
            <motion.h2 
              className="text-2xl font-bold truncate mb-1"
              initial={false}
              animate={{ opacity: loading ? 0.7 : 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentTrack?.name || "Select a station"}
            </motion.h2>
            <p className="text-sm text-muted-foreground truncate">
              {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
            </p>
            {loading && (
              <div className="flex justify-center items-center mt-2">
                <LoadingDots />
              </div>
            )}
            {currentTrack?.language && (
              <span className="inline-block px-2 py-1 bg-primary/10 text-xs rounded-full mt-2 text-primary">
                {currentTrack.language}
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              disabled={!currentTrack}
              className="h-10 w-10 rounded-full bg-accent hover:bg-accent/80 material-transition dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center"
            >
              <Button
                variant="default"
                size="icon"
                onClick={onPlayPause}
                disabled={!currentTrack}
                className={cn(
                  "h-14 w-14 rounded-full material-shadow-2 ink-ripple",
                  isPlaying ? "bg-primary/90" : "bg-primary"
                )}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 ml-0.5" />
                )}
              </Button>
            </motion.div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={!currentTrack}
              className="h-10 w-10 rounded-full bg-accent hover:bg-accent/80 material-transition dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Additional controls */}
          <div className="flex items-center justify-between">
            {/* Favorite button */}
            {onToggleFavorite && currentTrack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className={cn(
                  "h-8 w-8",
                  currentTrack.isFavorite ? "text-yellow-500" : "text-muted-foreground"
                )}
              >
                <Heart className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  currentTrack.isFavorite ? "fill-yellow-500 scale-110" : "",
                  "hover:scale-125"
                )} />
              </Button>
            )}

            {/* Volume control */}
            <div className="flex items-center space-x-2 flex-1 px-2 max-w-64 mx-auto">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(values) => onVolumeChange(values[0] / 100)}
                className="flex-1"
              />
            </div>

            {/* Placeholder for symmetry if needed */}
            {onToggleFavorite && <div className="w-8"></div>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
