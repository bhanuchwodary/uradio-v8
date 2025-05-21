
import React from "react";
import { EnhancedMusicPlayer } from "@/components/ui/player/EnhancedMusicPlayer";
import { Track } from "@/types/track";
import { motion } from "framer-motion";

interface EnhancedHomePagePlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  handlePlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  loading: boolean;
  onToggleFavorite?: () => void;
}

const EnhancedHomePagePlayer: React.FC<EnhancedHomePagePlayerProps> = ({
  currentTrack,
  isPlaying,
  handlePlayPause,
  handleNext,
  handlePrevious,
  volume,
  setVolume,
  loading,
  onToggleFavorite
}) => {
  return (
    <motion.div 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <EnhancedMusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        volume={volume}
        onVolumeChange={setVolume}
        loading={loading}
        onToggleFavorite={onToggleFavorite}
      />
    </motion.div>
  );
};

export default EnhancedHomePagePlayer;
