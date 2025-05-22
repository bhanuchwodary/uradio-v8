
import React from "react";
import { Track } from "@/types/track";
import { StationCard } from "@/components/ui/player/StationCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface StationGridProps {
  stations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number) => void;
  onEditStation?: (station: Track) => void;
  onDeleteStation?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  actionIcon?: "play" | "add"; // New prop to specify the primary action icon
}

export const StationGrid: React.FC<StationGridProps> = ({
  stations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite,
  actionIcon = "play" // Default is play
}) => {
  const isMobile = useIsMobile();
  
  if (!stations || stations.length === 0) {
    return (
      <div className="text-center p-4 sm:p-6 bg-background/50 rounded-lg">
        <p className="text-muted-foreground">No stations available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      {stations.map((station, index) => {
        const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
        const isSelected = station.url === currentTrackUrl;
        
        return (
          <StationCard
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
    </div>
  );
};
