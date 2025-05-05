
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Index: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  
  const { 
    tracks, 
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    editStationByValue,
    removeStationByValue,
    toggleFavorite,
    getUserStations
  } = useTrackStateContext();
  
  // Get favorite and popular stations
  const favoriteStations = tracks.filter(track => track.isFavorite);
  
  // Calculate popular stations based on play time
  const popularStations = [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);
    
  // Get user stations (not prebuilt)
  const userStations = getUserStations();
  // Get prebuilt stations
  const prebuiltStations = tracks.filter(track => track.isPrebuilt);
  
  // Derive URLs from tracks
  const urls = tracks.map(track => track.url);
  
  // Use player core for player functionality
  const {
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
  } = usePlayerCore({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });
  
  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;

  // Handle selecting a station from any list
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    // Find the corresponding index in the full tracks list
    const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
    if (mainIndex !== -1) {
      setCurrentIndex(mainIndex);
      setIsPlaying(true);
    }
  };
  
  // Toggle favorite for any station
  const handleToggleFavorite = (station: typeof tracks[0]) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      toggleFavorite(index);
    }
  };
  
  // Edit station handler
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };
  
  // Handle delete station
  const handleDeleteStation = (station: Track) => {
    removeStationByValue(station);
    toast({
      title: "Station removed",
      description: `${station.name} has been removed from your playlist`
    });
  };
  
  // Save edited station
  const handleSaveEdit = (data: { url: string; name: string }) => {
    if (editingStation) {
      editStationByValue(editingStation, data);
      toast({
        title: "Station updated",
        description: `"${data.name}" has been updated`,
      });
      setEditingStation(null);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Player Card */}
        <div className="mb-6">
          <MusicPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            volume={volume}
            onVolumeChange={setVolume}
            loading={loading}
          />
        </div>

        {/* Favorites Section */}
        {favoriteStations.length > 0 && (
          <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <StationGrid
                stations={favoriteStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => handleSelectStation(index, favoriteStations)}
                onToggleFavorite={handleToggleFavorite}
              />
            </CardContent>
          </Card>
        )}
        
        {/* All Stations Section */}
        <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="popular" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="mystations">My Stations</TabsTrigger>
                <TabsTrigger value="prebuilt">Prebuilt</TabsTrigger>
              </TabsList>
              
              <TabsContent value="popular" className="mt-4">
                <StationGrid
                  stations={popularStations}
                  currentIndex={currentIndex}
                  currentTrackUrl={currentTrack?.url}
                  isPlaying={isPlaying}
                  onSelectStation={(index) => handleSelectStation(index, popularStations)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </TabsContent>
              
              <TabsContent value="mystations" className="mt-4">
                <StationGrid
                  stations={userStations}
                  currentIndex={currentIndex}
                  currentTrackUrl={currentTrack?.url}
                  isPlaying={isPlaying}
                  onSelectStation={(index) => handleSelectStation(index, userStations)}
                  onEditStation={handleEditStation}
                  onDeleteStation={handleDeleteStation}
                  onToggleFavorite={handleToggleFavorite}
                />
              </TabsContent>
              
              <TabsContent value="prebuilt" className="mt-4">
                <StationGrid
                  stations={prebuiltStations}
                  currentIndex={currentIndex}
                  currentTrackUrl={currentTrack?.url}
                  isPlaying={isPlaying}
                  onSelectStation={(index) => handleSelectStation(index, prebuiltStations)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Edit station dialog */}
        {editingStation && (
          <EditStationDialog
            isOpen={!!editingStation}
            onClose={() => setEditingStation(null)}
            onSave={handleSaveEdit}
            initialValues={{
              url: editingStation.url,
              name: editingStation.name,
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
