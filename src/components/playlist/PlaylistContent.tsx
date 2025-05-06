
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { Track } from "@/types/track";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

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
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <Card className={cn(
      "border-none shadow-lg",
      isDark 
        ? "dark-glass bg-background/30" 
        : "light-glass bg-white/40"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <span className="relative">
            My Playlist
            <span className={cn(
              "absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full",
              isDark ? "bg-primary/70" : "bg-primary/60"
            )}></span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mystations" className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-2 mb-2",
            isDark 
              ? "bg-background/40" 
              : "bg-white/50"
          )}>
            <TabsTrigger value="mystations" className={cn(
              isDark 
                ? "data-[state=active]:bg-background/60" 
                : "data-[state=active]:bg-white/80"
            )}>
              My Stations
            </TabsTrigger>
            <TabsTrigger value="prebuilt" className={cn(
              isDark 
                ? "data-[state=active]:bg-background/60" 
                : "data-[state=active]:bg-white/80"
            )}>
              Prebuilt Stations
            </TabsTrigger>
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
