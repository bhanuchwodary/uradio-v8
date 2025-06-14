
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
  allTracks: Track[];
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
  allTracks,
  currentIndex,
  currentTrack,
  isPlaying,
  onSelectStation,
  onEditStation,
  onConfirmDelete,
  onToggleFavorite,
  onClearAll
}) => {
  return (
    <Card className="bg-surface-container dark:bg-surface-container-high border-none shadow-lg">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-on-surface">
            My Playlist
          </CardTitle>
          {allTracks.length > 0 && onClearAll && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onClearAll}
              className="flex items-center gap-2 rounded-full"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear All</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-1 sm:px-2">
        {allTracks.length > 0 ? (
          <StationGrid
            stations={allTracks}
            currentIndex={currentIndex}
            currentTrackUrl={currentTrack?.url}
            isPlaying={isPlaying}
            onSelectStation={(index) => onSelectStation(index, allTracks)}
            onEditStation={onEditStation}
            onDeleteStation={onConfirmDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ) : (
          <div className="text-center py-16 px-6 bg-surface-container-low dark:bg-surface-container rounded-xl border border-dashed border-outline-variant">
            <h3 className="text-lg font-semibold text-on-surface">Your Playlist is Empty</h3>
            <p className="text-on-surface-variant mt-2">
              Use the 'Add' page to add your favorite radio stations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
