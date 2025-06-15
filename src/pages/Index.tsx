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
import { getStations } from "@/data/featuredStationsLoader";

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
    
  // Get user stations (not featured)
  const userStations = getUserStations();
  // Get featured stations from loader
  const featuredStations = getStations().map(station => ({
    ...station,
    isFavorite: false,
    isFeatured: true,
    playTime: 0
  }));
  
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
    const selectedStation = stationList[stationIndex];
    // Find the full track object from the main tracks list to get the most up-to-date state
    const trackInMainList = tracks.find(t => t.url === selectedStation.url);

    // A station is playable only if it's in the playlist (favorite or has playtime)
    if (trackInMainList && (trackInMainList.isFavorite || (trackInMainList.playTime && trackInMainList.playTime > 0))) {
      const mainIndex = tracks.findIndex(t => t.url === selectedStation.url);
      if (mainIndex !== -1) {
        // If clicking on the currently playing station, toggle pause/play
        if (mainIndex === currentIndex && isPlaying) {
          setIsPlaying(false);
        } else {
          setCurrentIndex(mainIndex);
          setIsPlaying(true);
        }
      }
    } else {
      toast({
        title: "Not in Playlist",
        description: "Please add this station to your favorites to play it.",
      });
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
          featuredStations={featuredStations}
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
