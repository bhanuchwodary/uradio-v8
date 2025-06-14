
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Star, Radio } from "lucide-react";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";

interface PlaylistSectionProps {
  title: string;
  icon: React.ReactNode;
  stations: Track[];
  children: React.ReactNode;
}

const PlaylistSection: React.FC<PlaylistSectionProps> = ({ title, icon, stations, children }) => {
  if (stations.length === 0) {
    return null;
  }
  return (
    <div className="mb-6 last:mb-0">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-3 text-on-surface-variant px-2 sm:px-4">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
};

interface PlaylistContentProps {
  userStations: Track[];
  featuredStations: Track[];
  favoriteStations: Track[];
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
  currentIndex,
  currentTrack,
  isPlaying,
  onSelectStation,
  onEditStation,
  onConfirmDelete,
  onToggleFavorite,
  onClearAll,
}) => {
  const allPlaylistTracks = [...new Set([...userStations, ...featuredStations, ...favoriteStations])];
  const hasStations = allPlaylistTracks.length > 0;

  // Filter out favorites to avoid duplicating them in other sections
  const nonFavoriteUserStations = userStations.filter(
    (us) => !favoriteStations.some((fs) => fs.url === us.url)
  );
  const nonFavoriteFeaturedStations = featuredStations.filter(
    (fs) => !favoriteStations.some((fvs) => fvs.url === fs.url)
  );

  return (
    <Card className="bg-surface-container dark:bg-surface-container-high border-none shadow-lg">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-on-surface">
            My Playlist
          </CardTitle>
          {hasStations && onClearAll && (
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
        {!hasStations ? (
          <div className="text-center py-16 px-6 bg-surface-container-low dark:bg-surface-container rounded-xl border border-dashed border-outline-variant">
            <h3 className="text-lg font-semibold text-on-surface">Your Playlist is Empty</h3>
            <p className="text-on-surface-variant mt-2">
              Use the 'Add' or 'Station List' pages to add your favorite radio stations.
            </p>
          </div>
        ) : (
          <div>
            <PlaylistSection title="Favorites" icon={<Star className="h-5 w-5 text-yellow-400" />} stations={favoriteStations}>
              <StationGrid
                stations={favoriteStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => onSelectStation(index, favoriteStations)}
                onEditStation={onEditStation}
                onDeleteStation={onConfirmDelete}
                onToggleFavorite={onToggleFavorite}
              />
            </PlaylistSection>
            
            <PlaylistSection title="My Stations" icon={<Radio className="h-5 w-5" />} stations={nonFavoriteUserStations}>
              <StationGrid
                stations={nonFavoriteUserStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => onSelectStation(index, nonFavoriteUserStations)}
                onEditStation={onEditStation}
                onDeleteStation={onConfirmDelete}
                onToggleFavorite={onToggleFavorite}
              />
            </PlaylistSection>

            <PlaylistSection title="Featured" icon={<Radio className="h-5 w-5 text-primary" />} stations={nonFavoriteFeaturedStations}>
               <StationGrid
                stations={nonFavoriteFeaturedStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => onSelectStation(index, nonFavoriteFeaturedStations)}
                onEditStation={onEditStation}
                onDeleteStation={onConfirmDelete}
                onToggleFavorite={onToggleFavorite}
              />
            </PlaylistSection>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
