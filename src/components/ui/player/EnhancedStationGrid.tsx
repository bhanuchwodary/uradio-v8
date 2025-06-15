
import React from "react";
import { Track } from "@/types/track";
import { EnhancedStationCard } from "./EnhancedStationCard";
import { cn } from "@/lib/utils";

interface EnhancedStationGridProps {
  stations: Track[];
  currentIndex?: number;
  currentTrackUrl?: string;
  isPlaying?: boolean;
  onSelectStation: (index: number) => void;
  onEditStation?: (station: Track) => void;
  onDeleteStation?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  actionIcon?: "add" | "edit" | "delete";
  showLanguage?: boolean;
  compact?: boolean;
  className?: string;
}

export const EnhancedStationGrid: React.FC<EnhancedStationGridProps> = ({
  stations,
  currentIndex,
  currentTrackUrl,
  isPlaying = false,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite,
  actionIcon,
  showLanguage = true,
  compact = false,
  className
}) => {
  if (stations.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "grid gap-4 transition-all duration-300",
      compact 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      className
    )}>
      {stations.map((station, index) => {
        const isActive = currentTrackUrl === station.url;
        
        return (
          <EnhancedStationCard
            key={`${station.url}-${index}`}
            station={station}
            isActive={isActive}
            isPlaying={isActive && isPlaying}
            onSelect={() => onSelectStation(index)}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(station) : undefined}
            onEdit={onEditStation ? () => onEditStation(station) : undefined}
            onDelete={onDeleteStation ? () => onDeleteStation(station) : undefined}
            actionIcon={actionIcon}
            showLanguage={showLanguage}
            compact={compact}
          />
        );
      })}
    </div>
  );
};
