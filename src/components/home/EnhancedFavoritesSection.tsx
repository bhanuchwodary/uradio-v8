
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedStationGrid } from "@/components/ui/player/EnhancedStationGrid";
import { Track } from "@/types/track";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface EnhancedFavoritesSectionProps {
  favoriteStations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number, stationList: Track[]) => void;
  onToggleFavorite: (station: Track) => void;
  onDeleteStation: (station: Track) => void;
}

const EnhancedFavoritesSection: React.FC<EnhancedFavoritesSectionProps> = ({
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-none shadow-lg">
        <CardHeader className="pb-2 flex flex-row items-center space-y-0 gap-2">
          <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
          <CardTitle className="text-lg">Favorites</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedStationGrid
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
    </motion.div>
  );
};

export default EnhancedFavoritesSection;
