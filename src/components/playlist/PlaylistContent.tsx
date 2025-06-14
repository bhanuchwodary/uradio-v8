
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Music, Heart } from "lucide-react";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface PlaylistContentProps {
  userStations: Track[];
  featuredStations: Track[];
  favoriteStations: Track[];
  popularStations: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectStation: (index: number, stationList: Track[]) => void;
  onEditStation: (station: Track) => void;
  onConfirmDelete: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
  onClearAll?: () => void;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({
  userStations,
  featuredStations,
  favoriteStations,
  popularStations,
  currentIndex,
  currentTrack,
  isPlaying,
  onSelectStation,
  onEditStation,
  onConfirmDelete,
  onToggleFavorite,
  onClearAll
}) => {
  // Combine all stations into one unified playlist
  const allPlaylistStations = [
    ...favoriteStations,
    ...popularStations,
    ...userStations.filter(station => !station.isFeatured),
    ...featuredStations
  ];

  // Remove duplicates based on URL
  const uniquePlaylistStations = allPlaylistStations.filter((station, index, self) => 
    index === self.findIndex(s => s.url === station.url)
  );

  return (
    <Card className="glass-surface border-outline-variant/30 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-on-surface">
                My Playlist
              </CardTitle>
              <p className="text-sm text-on-surface-variant mt-0.5">
                {uniquePlaylistStations.length} stations
              </p>
            </div>
          </div>
          
          {uniquePlaylistStations.length > 0 && onClearAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="flex items-center gap-2 text-error border-error/30 hover:bg-error/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {uniquePlaylistStations.length > 0 ? (
          <StationGrid
            stations={uniquePlaylistStations}
            currentIndex={currentIndex}
            currentTrackUrl={currentTrack?.url}
            isPlaying={isPlaying}
            onSelectStation={(index) => onSelectStation(index, uniquePlaylistStations)}
            onEditStation={onEditStation}
            onDeleteStation={onConfirmDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-surface-container/30 rounded-2xl inline-block mb-4">
              <Music className="h-8 w-8 text-on-surface-variant" />
            </div>
            <h3 className="text-base font-medium text-on-surface mb-1">Your playlist is empty</h3>
            <p className="text-sm text-on-surface-variant">Add stations to build your collection</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
