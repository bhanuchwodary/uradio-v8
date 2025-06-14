
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { getStations } from "@/data/featuredStationsLoader";
import { Track } from "@/types/track";

const StationListPage: React.FC = () => {
  const { toast } = useToast();
  
  const { 
    tracks,
    currentIndex,
    isPlaying,
    addUrl,
  } = useTrackStateContext();
  
  // Get featured stations from loader
  const featuredStationsList = getStations();
  
  // Create proper track objects from featured stations data
  const featuredStationTracks: Track[] = featuredStationsList.map(station => ({
    ...station,
    isFavorite: false,
    isFeatured: true,
    playTime: 0
  }));
  
  // Get current track
  const currentTrack = tracks[currentIndex];
  
  // Group featured stations by language
  const stationsByLanguage: Record<string, Track[]> = {};
  
  featuredStationTracks.forEach(station => {
    const language = station.language || "Unknown";
    if (!stationsByLanguage[language]) {
      stationsByLanguage[language] = [];
    }
    stationsByLanguage[language].push(station);
  });
  
  // Add station to playlist handler
  const handleAddStation = (station: Track) => {
    const result = addUrl(
      station.url, 
      station.name, 
      station.isFeatured || false,
      station.isFavorite || false,
      station.language || ""
    );
    
    if (result.success) {
      toast({
        title: "Station Added",
        description: `${station.name} has been added to your playlist`,
      });
    } else {
      toast({
        title: "Failed to Add Station",
        description: result.message || "Error adding station",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Station List</h1>
        </div>
        
        {Object.entries(stationsByLanguage).map(([language, stations]) => (
          <Card key={language} className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Featured {language} Stations</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <StationGrid
                stations={stations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => handleAddStation(stations[index])}
                actionIcon="add"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
};

export default StationListPage;
