
import React from "react";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface PlaylistPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  handlePlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  loading: boolean;
}

const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({
  currentTrack,
  isPlaying,
  handlePlayPause,
  handleNext,
  handlePrevious,
  volume,
  setVolume,
  loading
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <div className={cn(
      "mb-6 relative",
      isPlaying && "animate-pulse-glow"
    )}>
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-70 blur-xl -z-10 transition-all",
        isPlaying ? "opacity-70" : "opacity-40",
        isDark ? "bg-gradient-to-r from-primary/40 to-accent/30" : 
                "bg-gradient-to-r from-primary/30 to-accent/30"
      )} />
      
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        volume={volume}
        onVolumeChange={setVolume}
        loading={loading}
      />
    </div>
  );
};

export default PlaylistPlayer;
