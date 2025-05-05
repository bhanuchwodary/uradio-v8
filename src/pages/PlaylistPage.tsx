
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import PlaylistPlayer from "@/components/playlist/PlaylistPlayer";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";

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
        {/* Player Component */}
        <PlaylistPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          handlePlayPause={handlePlayPause}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          volume={volume}
          setVolume={setVolume}
          loading={loading}
        />
        
        {/* Playlist Content Component */}
        <PlaylistContent
          userStations={userStations}
          prebuiltStations={prebuiltStations}
          currentIndex={currentIndex}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onEditStation={handleEditStation}
          onConfirmDelete={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
        />
        
        {/* Dialogs Component */}
        <PlaylistDialogs
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

export default PlaylistPage;
