
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import HomePagePlayer from "@/components/home/HomePagePlayer";
import FavoritesSection from "@/components/home/FavoritesSection";
import StationsTabsSection from "@/components/home/StationsTabsSection";
import HomePageDialogs from "@/components/home/HomePageDialogs";

const Index: React.FC = () => {
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
        <HomePagePlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          volume={volume}
          setVolume={setVolume}
          loading={loading}
        />

        {/* Favorites Section */}
        <FavoritesSection 
          favoriteStations={favoriteStations}
          currentIndex={currentIndex}
          currentTrackUrl={currentTrack?.url}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onToggleFavorite={handleToggleFavorite}
          onDeleteStation={handleConfirmDelete}
        />
        
        {/* All Stations Section with Tabs */}
        <StationsTabsSection
          popularStations={popularStations}
          userStations={userStations}
          prebuiltStations={prebuiltStations}
          currentIndex={currentIndex}
          currentTrackUrl={currentTrack?.url}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onEditStation={handleEditStation}
          onDeleteStation={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
        />
        
        {/* Dialogs for editing and deleting */}
        <HomePageDialogs 
          editingStation={editingStation}
          stationToDelete={stationToDelete}
          onCloseEditDialog={() => setEditingStation(null)}
          onSaveEdit={handleSaveEdit}
          onCloseDeleteDialog={() => setStationToDelete(null)}
          onConfirmDelete={handleDeleteStation}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
