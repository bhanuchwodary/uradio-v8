
import { useState } from "react";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import { useTrackStateContext } from "@/context/TrackStateContext";

export const useHomePageState = () => {
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
      
      // Show toast when toggling favorite
      toast({
        title: station.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${station.name} ${station.isFavorite ? "removed from" : "added to"} your favorites`,
        duration: 2000,
      });
    }
  };
  
  // Toggle favorite for current track
  const handleToggleCurrentFavorite = () => {
    if (currentTrack) {
      handleToggleFavorite(currentTrack);
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

  return {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    currentTrack,
    favoriteStations,
    popularStations,
    userStations,
    prebuiltStations,
    editingStation,
    stationToDelete,
    handleSelectStation,
    handleToggleFavorite,
    handleToggleCurrentFavorite,
    handleEditStation,
    handleConfirmDelete,
    handleDeleteStation,
    handleSaveEdit,
    setEditingStation,
    setStationToDelete
  };
};
