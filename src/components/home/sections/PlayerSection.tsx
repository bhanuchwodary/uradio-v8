
import React from "react";
import { Track } from "@/types/track";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import EnhancedHomePagePlayer from "@/components/home/EnhancedHomePagePlayer";
import { motion } from "framer-motion";

interface PlayerSectionProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTrack: Track | null;
  onToggleFavorite: () => void;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({
  tracks,
  currentIndex,
  isPlaying,
  setCurrentIndex,
  setIsPlaying,
  currentTrack,
  onToggleFavorite
}) => {
  // Derive URLs from tracks
  const urls = tracks.map(track => track.url);
  
  // Use player core for player functionality
  const {
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
  } = usePlayerCore({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <EnhancedHomePagePlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        handlePlayPause={handlePlayPause}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        volume={volume}
        setVolume={setVolume}
        loading={loading}
        onToggleFavorite={onToggleFavorite}
      />
    </motion.div>
  );
};

export default PlayerSection;
