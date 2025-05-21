
import React from "react";
import { Track } from "@/types/track";
import { EnhancedStationCard } from "@/components/ui/player/EnhancedStationCard";
import { motion } from "framer-motion";

interface EnhancedStationGridProps {
  stations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number) => void;
  onEditStation?: (station: Track) => void;
  onDeleteStation?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  actionIcon?: "play" | "add"; 
  title?: string;
}

export const EnhancedStationGrid: React.FC<EnhancedStationGridProps> = ({
  stations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite,
  actionIcon = "play",
  title
}) => {
  if (!stations || stations.length === 0) {
    return (
      <div className="text-center p-6 bg-background/50 rounded-lg backdrop-blur-md">
        <p className="text-muted-foreground">No stations available</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div>
      {title && (
        <h3 className="text-lg font-medium mb-4 text-foreground">{title}</h3>
      )}
      
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stations.map((station, index) => {
          const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
          const isSelected = station.url === currentTrackUrl;
          
          return (
            <EnhancedStationCard
              key={`${station.url}-${index}-${isSelected}`}
              station={station}
              isPlaying={isCurrentlyPlaying}
              isSelected={isSelected}
              onPlay={() => onSelectStation(index)}
              onEdit={onEditStation ? () => onEditStation(station) : undefined}
              onDelete={onDeleteStation ? () => onDeleteStation(station) : undefined}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(station) : undefined}
              actionIcon={actionIcon}
            />
          );
        })}
      </motion.div>
    </div>
  );
};
