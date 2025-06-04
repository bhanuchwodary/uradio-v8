import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { getStations } from "@/data/featuredStationsLoader";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";

const StationListPage: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  
  const { 
    tracks,
    currentIndex,
    isPlaying,
    addUrl,
    editStationByValue,
    removeStationByValue,
    getUserStations
  } = useTrackStateContext();
  
  // Get user stations
  const userStations = getUserStations();
  
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
      station.isPrebuilt || false,
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
  
  // Handle edit station
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };
  
  // Handle delete station
  const handleDeleteStation = (station: Track) => {
    removeStationByValue(station);
    toast({
      title: "Station removed",
      description: `${station.name} has been removed from your stations`
    });
  };
  
  // Save edited station
  const handleSaveEdit = (data: { url: string; name: string; language?: string }) => {
    if (editingStation) {
      editStationByValue(editingStation, data);
      toast({
        title: "Station updated",
        description: `${data.name} has been updated`
      });
      setEditingStation(null);
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Station List</h1>
        </div>
        
        {/* User Stations */}
        <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground">My Stations</CardTitle>
          </CardHeader>
          <CardContent>
            {userStations.length > 0 ? (
              <StationGrid
                stations={userStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => handleAddStation(userStations[index])}
                onEditStation={handleEditStation}
                onDeleteStation={handleDeleteStation}
                actionIcon="add"
              />
            ) : (
              <div className="text-center p-6 bg-background/50 rounded-lg">
                <p className="text-muted-foreground">No stations added yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Featured Stations - Now grouped by language */}
        {Object.entries(stationsByLanguage).map(([language, stations]) => (
          <Card key={language} className="bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-foreground">Featured {language} Stations</CardTitle>
            </CardHeader>
            <CardContent>
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
        
        {/* Edit station dialog */}
        {editingStation && (
          <EditStationDialog
            isOpen={!!editingStation}
            onClose={() => setEditingStation(null)}
            onSave={handleSaveEdit}
            initialValues={{
              url: editingStation.url,
              name: editingStation.name,
              language: editingStation.language
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default StationListPage;
