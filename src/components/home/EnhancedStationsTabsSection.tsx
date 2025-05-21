
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedStationGrid } from "@/components/ui/player/EnhancedStationGrid";
import { Track } from "@/types/track";
import { motion } from "framer-motion";
import { Sparkles, Radio, Music } from "lucide-react";

interface EnhancedStationsTabsSectionProps {
  popularStations: Track[];
  userStations: Track[];
  prebuiltStations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number, stationList: Track[]) => void;
  onEditStation: (station: Track) => void;
  onDeleteStation: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
}

const EnhancedStationsTabsSection: React.FC<EnhancedStationsTabsSectionProps> = ({
  popularStations,
  userStations,
  prebuiltStations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-none shadow-lg">
        <CardContent className="p-0">
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none rounded-t-lg bg-background/50">
              <TabsTrigger value="popular" className="flex items-center gap-1 data-[state=active]:bg-primary/20">
                <Sparkles className="h-4 w-4" /> 
                <span className="hidden sm:inline">Popular</span>
              </TabsTrigger>
              <TabsTrigger value="mine" className="flex items-center gap-1 data-[state=active]:bg-primary/20">
                <Radio className="h-4 w-4" /> 
                <span className="hidden sm:inline">My Stations</span>
              </TabsTrigger>
              <TabsTrigger value="prebuilt" className="flex items-center gap-1 data-[state=active]:bg-primary/20">
                <Music className="h-4 w-4" /> 
                <span className="hidden sm:inline">Prebuilt</span>
              </TabsTrigger>
            </TabsList>
            <div className="p-4">
              <TabsContent value="popular" className="mt-1">
                <EnhancedStationGrid
                  stations={popularStations}
                  currentIndex={currentIndex}
                  currentTrackUrl={currentTrackUrl}
                  isPlaying={isPlaying}
                  onSelectStation={(index) => onSelectStation(index, popularStations)}
                  onEditStation={onEditStation}
                  onDeleteStation={onDeleteStation}
                  onToggleFavorite={onToggleFavorite}
                  title="Popular Stations"
                />
              </TabsContent>
              <TabsContent value="mine" className="mt-1">
                <EnhancedStationGrid
                  stations={userStations}
                  currentIndex={currentIndex}
                  currentTrackUrl={currentTrackUrl}
                  isPlaying={isPlaying}
                  onSelectStation={(index) => onSelectStation(index, userStations)}
                  onEditStation={onEditStation}
                  onDeleteStation={onDeleteStation}
                  onToggleFavorite={onToggleFavorite}
                  title="My Stations"
                />
              </TabsContent>
              <TabsContent value="prebuilt" className="mt-1">
                <EnhancedStationGrid
                  stations={prebuiltStations}
                  currentIndex={currentIndex}
                  currentTrackUrl={currentTrackUrl}
                  isPlaying={isPlaying}
                  onSelectStation={(index) => onSelectStation(index, prebuiltStations)}
                  onToggleFavorite={onToggleFavorite}
                  title="Prebuilt Stations"
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedStationsTabsSection;
