
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
  const { addUrl, tracks, currentIndex, isPlaying } = useTrackStateContext();

  const featuredStationsList = getStations();
  const currentTrack = tracks[currentIndex];

  const featuredStationTracks: Track[] = featuredStationsList.map(station => ({
    ...station,
    isFavorite: false,
    isFeatured: true,
    playTime: 0
  }));
  
  const stationsByLanguage: Record<string, Track[]> = {};
  featuredStationTracks.forEach(station => {
    const language = station.language || "Other";
    if (!stationsByLanguage[language]) {
      stationsByLanguage[language] = [];
    }
    stationsByLanguage[language].push(station);
  });
  
  const handleAddStation = (station: Track) => {
    const result = addUrl(
      station.url, 
      station.name, 
      station.isFeatured || false,
      false,
      station.language || ""
    );
    
    if (result.success) {
      toast({
        title: "Station Added",
        description: `${station.name} has been added to your playlist.`,
      });
    } else {
      toast({
        title: "Failed to Add Station",
        description: result.message || "This station might already be in your playlist.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Discover Stations</h1>
        </div>
        
        {Object.entries(stationsByLanguage).sort(([a], [b]) => a.localeCompare(b)).map(([language, stations]) => (
          <Card key={language} className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{language} Stations</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <StationGrid
                stations={stations}
                currentIndex={-1}
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
