
import React from "react";
import { Track } from "@/types/track";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { NoFavoritesEmptyState } from "@/components/ui/empty-states/StationEmptyStates";
import { Heart } from "lucide-react";

interface FavoritesSectionProps {
  favoriteStations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (stationIndex: number, stationList: Track[]) => void;
  onToggleFavorite: (station: Track) => void;
  onDeleteStation: (station: Track) => void;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favoriteStations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onToggleFavorite,
  onDeleteStation
}) => {
  if (favoriteStations.length === 0) {
    return (
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-foreground">Favorite Stations</h2>
        </div>
        <NoFavoritesEmptyState />
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-bold text-foreground">Favorite Stations</h2>
        </div>
        <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {favoriteStations.length} station{favoriteStations.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <StationGrid
        stations={favoriteStations}
        currentIndex={currentIndex}
        currentTrackUrl={currentTrackUrl}
        isPlaying={isPlaying}
        onSelectStation={(index) => onSelectStation(index, favoriteStations)}
        onDeleteStation={onDeleteStation}
        onToggleFavorite={onToggleFavorite}
        context="playlist"
        variant="large"
        showFeatured={false}
      />
    </section>
  );
};

export default FavoritesSection;
