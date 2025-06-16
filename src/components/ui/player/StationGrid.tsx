
import React, { memo } from "react";
import { Track } from "@/types/track";
import { StationCard } from "@/components/ui/player/StationCard";
import { logger } from "@/utils/logger";

interface StationGridProps {
  stations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number) => void;
  onEditStation?: (station: Track) => void;
  onDeleteStation?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  actionIcon?: "play" | "add";
}

export const StationGrid: React.FC<StationGridProps> = memo(({
  stations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite,
  actionIcon = "play"
}) => {
  if (!stations || stations.length === 0) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">No stations available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
      {stations.map((station, index) => {
        const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
        const isSelected = station.url === currentTrackUrl;
        
        // Create a stable key based on station properties that matter for rendering
        const stationKey = `${station.url}-${station.name}-${station.language || 'unknown'}`;
        
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          logger.debug("Rendering station in grid", { 
            name: station.name, 
            language: station.language,
            key: stationKey,
            isSelected,
            isPlaying: isCurrentlyPlaying
          });
        }
        
        return (
          <StationCard
            key={stationKey}
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
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.stations.length === nextProps.stations.length &&
    prevProps.currentTrackUrl === nextProps.currentTrackUrl &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.stations.every((station, index) => 
      station.url === nextProps.stations[index]?.url &&
      station.name === nextProps.stations[index]?.name &&
      station.isFavorite === nextProps.stations[index]?.isFavorite
    )
  );
});

StationGrid.displayName = "StationGrid";
