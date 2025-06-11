
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
    setCurrentIndex,
    setIsPlaying,
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
  
  // Handle selecting a station (play it directly)
  const handleSelectStation = (stationIndex: number, stationList: Track[]) => {
    const selectedStation = stationList[stationIndex];
    console.log("StationListPage - Selecting station:", selectedStation);
    
    // Find the corresponding index in the full tracks list
    const mainIndex = tracks.findIndex(t => t.url === selectedStation.url);
    if (mainIndex !== -1) {
      console.log("StationListPage - Found station at index:", mainIndex);
      setCurrentIndex(mainIndex);
      setIsPlaying(true);
    } else {
      console.log("StationListPage - Station not found in tracks, adding first");
      // If station not in playlist, add it first then play
      handleAddStation(selectedStation);
    }
  };
  
  // Add station to playlist handler
  const handleAddStation = (station: Track) => {
    console.log("StationListPage - Adding station to playlist:", station);
    
    const result = addUrl(
      station.url, 
      station.name, 
      false, // Don't mark as featured when adding to user playlist
      station.isFavorite || false,
      station.language || ""
    );
    
    console.log("StationListPage - Add station result:", result);
    
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
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Station List</h1>
        </div>
        
        {/* My Stations Section */}
        <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">My Stations</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {userStations.length > 0 ? (
              <StationGrid
                stations={userStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={handleSelectStation}
                onEditStation={handleEditStation}
                onDeleteStation={handleDeleteStation}
                actionIcon="play"
              />
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50">
                <p className="text-muted-foreground">No stations added yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Add stations to build your collection</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Featured Stations by Language */}
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
