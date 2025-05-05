
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

const PlaylistPage: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  
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
  
  // Split stations into user and prebuilt
  const userStations = getUserStations();
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
  
  // Handle selecting a station from a grid
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    // Find the corresponding index in the full tracks list
    const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
    if (mainIndex !== -1) {
      setCurrentIndex(mainIndex);
      setIsPlaying(true);
    }
  };
  
  // Edit station handler
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };
  
  // Open the delete confirmation dialog for a station
  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };
  
  // Handle actual deletion after confirmation
  const handleDeleteStation = () => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
      removeStationByValue(stationToDelete);
      toast({
        title: "Station removed",
        description: `${stationName} has been removed from your playlist`
      });
      setStationToDelete(null);
    }
  };
  
  // Toggle favorite for a station
  const handleToggleFavorite = (station: Track) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      toggleFavorite(index);
    }
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
                  onSelectStation={(index) => handleSelectStation(index, userStations)}
                  onEditStation={handleEditStation}
                  onDeleteStation={handleConfirmDelete}
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
                  onDeleteStation={handleConfirmDelete}
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

        {/* Delete confirmation dialog */}
        <AlertDialog 
          open={!!stationToDelete} 
          onOpenChange={(open) => !open && setStationToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Station</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove "{stationToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStation}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default PlaylistPage;
