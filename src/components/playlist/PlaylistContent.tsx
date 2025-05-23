
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";

interface PlaylistContentProps {
  userStations: Track[];
  prebuiltStations: Track[];
  favoriteStations: Track[];
  popularStations: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  onSelectStation: (index: number, stationList: Track[]) => void;
  onEditStation: (station: Track) => void;
  onConfirmDelete: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
}

const PlaylistContent: React.FC<PlaylistContentProps> = ({
  userStations,
  prebuiltStations,
  favoriteStations,
  popularStations,
  currentIndex,
  currentTrack,
  isPlaying,
  onSelectStation,
  onEditStation,
  onConfirmDelete,
  onToggleFavorite
}) => {
  return (
    <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-lg text-foreground">My Playlist</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {favoriteStations.length > 0 && (
          <div className="mb-8">
            <h3 className="font-medium text-base mb-4">Favorites</h3>
            <StationGrid
              stations={favoriteStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, favoriteStations)}
              onToggleFavorite={onToggleFavorite}
              onDeleteStation={onConfirmDelete}
            />
          </div>
        )}
      
        <Tabs defaultValue="popular" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-2 h-auto p-1">
            <TabsTrigger value="popular" className="text-xs py-1.5 sm:py-2 sm:text-sm px-1 h-auto">Popular</TabsTrigger>
            <TabsTrigger value="mystations" className="text-xs py-1.5 sm:py-2 sm:text-sm px-1 h-auto">My Stations</TabsTrigger>
            <TabsTrigger value="prebuilt" className="text-xs py-1.5 sm:py-2 sm:text-sm px-1 h-auto">Prebuilt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
            <StationGrid
              stations={popularStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, popularStations)}
              onToggleFavorite={onToggleFavorite}
              onDeleteStation={onConfirmDelete}
            />
            
            {popularStations.length === 0 && (
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">No popular stations available yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mystations" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
            <StationGrid
              stations={userStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, userStations)}
              onEditStation={onEditStation}
              onDeleteStation={onConfirmDelete}
              onToggleFavorite={onToggleFavorite}
            />
            
            {userStations.length === 0 && (
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">You haven't added any stations yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="prebuilt" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
            <StationGrid
              stations={prebuiltStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, prebuiltStations)}
              onToggleFavorite={onToggleFavorite}
              onDeleteStation={onConfirmDelete}
            />
            
            {prebuiltStations.length === 0 && (
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">No prebuilt stations available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
