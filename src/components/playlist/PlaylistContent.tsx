
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
    <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          My Playlist
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 space-y-6">
        {favoriteStations.length > 0 && (
          <div>
            <h3 className="font-semibold text-base mb-4 text-foreground/90 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Favorites
            </h3>
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
          <TabsList className="w-full grid grid-cols-3 mb-4 h-11 p-1 bg-background/50 backdrop-blur-sm">
            <TabsTrigger 
              value="popular" 
              className="text-sm py-2 px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-medium transition-all"
            >
              Popular
            </TabsTrigger>
            <TabsTrigger 
              value="mystations" 
              className="text-sm py-2 px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-medium transition-all"
            >
              My Stations
            </TabsTrigger>
            <TabsTrigger 
              value="prebuilt" 
              className="text-sm py-2 px-3 data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-medium transition-all"
            >
              Prebuilt
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
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
              <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50">
                <p className="text-muted-foreground">No popular stations available yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Listen to stations to see them here</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mystations" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
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
              <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50">
                <p className="text-muted-foreground">You haven't added any stations yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Add stations to build your collection</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="prebuilt" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
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
              <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50">
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
