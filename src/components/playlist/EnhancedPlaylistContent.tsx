
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedStationGrid } from "@/components/ui/player/EnhancedStationGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Track } from "@/types/track";
import { Heart, TrendingUp, User, Star, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EnhancedPlaylistContentProps {
  userStations: Track[];
  featuredStations: Track[];
  favoriteStations: Track[];
  popularStations: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectStation: (index: number, stations: Track[]) => void;
  onEditStation: (station: Track) => void;
  onConfirmDelete: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
  onClearAll: () => void;
}

export const EnhancedPlaylistContent: React.FC<EnhancedPlaylistContentProps> = ({
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
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Favorites Section */}
      {favoriteStations.length > 0 && (
        <Card className="bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200/30 dark:border-red-800/30 elevation-2">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Favorite Stations
              </CardTitle>
              <span className="text-sm text-on-surface-variant bg-red-100/50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                {favoriteStations.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <EnhancedStationGrid
              stations={favoriteStations}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, favoriteStations)}
              onEditStation={onEditStation}
              onDeleteStation={onConfirmDelete}
              onToggleFavorite={onToggleFavorite}
              compact={true}
            />
          </CardContent>
        </Card>
      )}

      {/* My Stations Section */}
      <Card className="bg-gradient-to-br from-surface-container/60 to-surface-container-low/60 backdrop-blur-md border-outline-variant/20 elevation-2">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              My Stations
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant bg-primary/10 px-2 py-1 rounded-full">
                {userStations.length}
              </span>
              {userStations.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAll}
                  className="text-error hover:text-error hover:bg-error/10 border-error/30"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {userStations.length > 0 ? (
            <EnhancedStationGrid
              stations={userStations}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, userStations)}
              onEditStation={onEditStation}
              onDeleteStation={onConfirmDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ) : (
            <EmptyState
              icon={User}
              title="No stations in your collection"
              description="Add your favorite radio stations to start building your personal collection"
              actionLabel="Add Your First Station"
              onAction={() => navigate("/add")}
              variant="minimal"
            />
          )}
        </CardContent>
      </Card>

      {/* Popular Stations Section */}
      {popularStations.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200/30 dark:border-orange-800/30 elevation-2">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Most Played
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <EnhancedStationGrid
              stations={popularStations}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, popularStations)}
              onEditStation={onEditStation}
              onDeleteStation={onConfirmDelete}
              onToggleFavorite={onToggleFavorite}
              compact={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Featured Stations Section */}
      {featuredStations.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/30 dark:border-blue-800/30 elevation-2">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              Featured Stations
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <EnhancedStationGrid
              stations={featuredStations}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, featuredStations)}
              onToggleFavorite={onToggleFavorite}
              actionIcon="add"
              compact={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
