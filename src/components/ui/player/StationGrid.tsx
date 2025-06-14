
import React from "react";
import { Track } from "@/types/track";
import { StationCard } from "@/components/ui/player/StationCard";

interface StationGridProps {
  stations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number) => void;
  onEditStation?: (station: Track) => void;
  onDeleteStation?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  onToggleInPlaylist?: (station: Track) => void; // <-- ADDED
  actionIcon?: "play" | "add";
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
  onToggleInPlaylist,
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
        const stationKey = `${station.url}-${station.name}-${station.language || 'unknown'}`;
        console.log("Rendering station in grid:", { 
          name: station.name, 
          language: station.language,
          key: stationKey,
          isSelected,
          isPlaying: isCurrentlyPlaying
        });
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
            onToggleInPlaylist={onToggleInPlaylist ? () => onToggleInPlaylist(station) : undefined} {/* <-- PASSED */}
            actionIcon={actionIcon}
          />
        );
      })}
    </div>
  );
};
