
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";
import { PlaylistTrack } from "@/context/PlaylistContext";
import ExportPlaylistButtons from "./ExportPlaylistButtons";

interface PlaylistContentProps {
  playlistTracks: PlaylistTrack[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectStation: (index: number) => void;
  onEditStation: (station: Track) => void;
  onConfirmDelete: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
  onClearAll?: () => void;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({
  playlistTracks,
  currentIndex,
  currentTrack,
  isPlaying,
  onSelectStation,
  onEditStation,
  onConfirmDelete,
  onToggleFavorite,
  onClearAll
}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log("PlaylistContent rendering with tracks:", playlistTracks.length, playlistTracks);
  }

  return (
    <Card className="bg-surface-container border border-outline-variant/30 rounded-lg elevation-1">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-on-surface">
            My Playlist
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Export buttons */}
            <ExportPlaylistButtons 
              tracks={playlistTracks} 
              disabled={playlistTracks.length === 0}
            />
            
            {/* Clear all button */}
            {playlistTracks.length > 0 && onClearAll && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onClearAll}
                className="flex items-center gap-2"
                aria-label="Clear all stations from playlist"
              >
                {/* Icon only on mobile */}
                <span className="inline-flex sm:hidden">
                  <Trash2 className="h-5 w-5" />
                </span>
                {/* Icon + label on desktop */}
                <span className="hidden sm:inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear Playlist
                </span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 space-y-6">
        {playlistTracks.length > 0 ? (
          <StationGrid
            stations={playlistTracks}
            currentIndex={currentIndex}
            currentTrackUrl={currentTrack?.url}
            isPlaying={isPlaying}
            onSelectStation={onSelectStation}
            onEditStation={onEditStation}
            onDeleteStation={onConfirmDelete}
            onToggleFavorite={onToggleFavorite}
            context="playlist"
          />
        ) : (
          <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50">
            <p className="text-muted-foreground">Your playlist is empty</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Add stations from the Stations screen to build your playlist</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
