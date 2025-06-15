
import React from "react";
import { Track } from "@/types/track";
import { StationCard } from "@/components/ui/player/StationCard";
import { Skeleton } from "@/components/ui/skeleton";

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
  isLoading?: boolean;
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
  actionIcon = "play",
  isLoading = false
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 animate-fade-in">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-3 p-3 rounded-xl bg-surface-container/50 backdrop-blur-sm">
            <Skeleton className="w-12 h-12 rounded-full mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-16 mx-auto rounded-full" />
            </div>
            <div className="flex justify-center space-x-1">
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state with better visual treatment
  if (!stations || stations.length === 0) {
    return (
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-surface-container/30 to-surface-container-high/20 border border-outline-variant/20 backdrop-blur-sm animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-high/50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-outline-variant/30" />
        </div>
        <p className="text-on-surface-variant text-sm font-medium">No stations available</p>
        <p className="text-on-surface-variant/70 text-xs mt-1">Add some stations to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 animate-fade-in">
      {stations.map((station, index) => {
        const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
        const isSelected = station.url === currentTrackUrl;
        
        // FIXED: Use stable URL-based key to prevent blinking/re-renders
        const stationKey = station.url;
        
        return (
          <div 
            key={stationKey}
            className="animate-scale-in"
          >
            <StationCard
              station={station}
              isPlaying={isCurrentlyPlaying}
              isSelected={isSelected}
              onPlay={() => onSelectStation(index)}
              onEdit={onEditStation ? () => onEditStation(station) : undefined}
              onDelete={onDeleteStation ? () => onDeleteStation(station) : undefined}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(station) : undefined}
              actionIcon={actionIcon}
            />
          </div>
        );
      })}
    </div>
  );
};
