
import React from "react";
import { Track } from "@/types/track";
import { Music, Heart, Edit3, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export const StationGrid: React.FC<StationGridProps> = ({
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
      <div className="text-center py-8">
        <div className="p-4 bg-surface-container/30 rounded-2xl inline-block mb-3">
          <Music className="h-6 w-6 text-on-surface-variant" />
        </div>
        <p className="text-sm text-on-surface-variant">No stations available</p>
      </div>
    );
  }

  return (
    <div className="responsive-grid-stations">
      {stations.map((station, index) => {
        const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
        const isSelected = station.url === currentTrackUrl;
        const stationKey = `${station.url}-${station.name}-${station.language || 'unknown'}`;
        
        return (
          <div
            key={stationKey}
            onClick={() => onSelectStation(index)}
            className={cn(
              "group relative p-3 rounded-xl border transition-modern cursor-pointer",
              isSelected
                ? "bg-primary/10 border-primary/30 elevation-1"
                : "bg-surface-container/50 border-outline-variant/30 hover:bg-surface-container hover:border-outline-variant/50 hover:elevation-1"
            )}
          >
            {/* Station Visual */}
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-tertiary/20 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
              {actionIcon === "add" ? (
                <Plus className="h-4 w-4 text-on-surface-variant" />
              ) : (
                <Music className={cn(
                  "transition-modern",
                  isCurrentlyPlaying ? "h-5 w-5 text-primary animate-pulse" : "h-4 w-4 text-on-surface-variant"
                )} />
              )}
              
              {station.language && (
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-surface/80 backdrop-blur-sm rounded text-xs font-medium text-on-surface">
                  {station.language}
                </div>
              )}
            </div>
            
            {/* Station Info */}
            <div>
              <h3 className="text-xs font-medium text-on-surface truncate mb-0.5">
                {station.name}
              </h3>
              {isCurrentlyPlaying && (
                <p className="text-xs text-primary">Now Playing</p>
              )}
            </div>
            
            {/* Action Buttons - Only show on hover/selected */}
            <div className={cn(
              "absolute top-2 left-2 flex gap-1 transition-modern",
              "opacity-0 group-hover:opacity-100",
              isSelected && "opacity-100"
            )}>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(station);
                  }}
                  className="h-6 w-6 glass-surface"
                >
                  <Heart className={cn(
                    "h-3 w-3",
                    station.isFavorite ? "fill-red-500 text-red-500" : "text-on-surface-variant"
                  )} />
                </Button>
              )}
              
              {onEditStation && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStation(station);
                  }}
                  className="h-6 w-6 glass-surface"
                >
                  <Edit3 className="h-3 w-3 text-on-surface-variant" />
                </Button>
              )}
              
              {onDeleteStation && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStation(station);
                  }}
                  className="h-6 w-6 glass-surface hover:text-error"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
