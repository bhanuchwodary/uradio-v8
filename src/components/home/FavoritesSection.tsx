
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";

interface FavoritesSectionProps {
  favoriteStations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number, stationList: Track[]) => void;
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
    return null;
  }

  return (
    <Card className="bg-surface-container border border-outline-variant/30 rounded-lg elevation-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Favorites</CardTitle>
      </CardHeader>
      <CardContent>
        <StationGrid
          stations={favoriteStations}
          currentIndex={currentIndex}
          currentTrackUrl={currentTrackUrl}
          isPlaying={isPlaying}
          onSelectStation={(index) => onSelectStation(index, favoriteStations)}
          onToggleFavorite={onToggleFavorite}
          onDeleteStation={onDeleteStation}
        />
      </CardContent>
    </Card>
  );
};

export default FavoritesSection;
