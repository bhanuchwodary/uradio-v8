
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";

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
  // Combine all stations and filter for what should be in the playlist
  const allStations = [
    ...favoriteStations,
    ...popularStations,
    ...userStations,
    ...featuredStations
  ].filter((station, index, self) => 
    index === self.findIndex(s => s.url === station.url)
  );

  // A station is in the playlist if it's a favorite or has been played.
  const playlistStations = allStations.filter(
    station => station.isFavorite || (station.playTime && station.playTime > 0)
  );

  return (
    <Card className="bg-surface-container border border-outline-variant/30 rounded-lg elevation-1">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-on-surface">
            My Playlist
          </CardTitle>
          {/* Only show clear all if there are stations in the playlist */}
          {playlistStations.length > 0 && onClearAll && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearAll}
              className="flex items-center gap-2"
              aria-label="Clear all stations"
            >
              {/* Icon only on mobile */}
              <span className="inline-flex sm:hidden">
                <Trash2 className="h-5 w-5" />
              </span>
              {/* Icon + label on desktop */}
              <span className="hidden sm:inline-flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 space-y-6">
        {playlistStations.length > 0 ? (
          <StationGrid
            stations={playlistStations}
            currentIndex={currentIndex}
            currentTrackUrl={currentTrack?.url}
            isPlaying={isPlaying}
            onSelectStation={(index) => onSelectStation(index, playlistStations)}
            onEditStation={onEditStation}
            onDeleteStation={onConfirmDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50">
            <p className="text-muted-foreground">Your playlist is empty</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Play a station or add one to your favorites to see it here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
