
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";

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
        <CardTitle className="text-lg">My Playlist</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mystations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mystations">My Stations</TabsTrigger>
            <TabsTrigger value="prebuilt">Prebuilt Stations</TabsTrigger>
          </TabsList>
          
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlaylistContent;
