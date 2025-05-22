
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";
import { getStations } from "@/data/prebuiltStationsLoader";

interface PlaylistContentProps {
  userStations: Track[];
  prebuiltStations: Track[];
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
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-foreground">My Playlist</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prebuilt" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prebuilt">Prebuilt Stations</TabsTrigger>
            <TabsTrigger value="mystations">My Stations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prebuilt" className="mt-4">
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
          
          <TabsContent value="mystations" className="mt-4">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
