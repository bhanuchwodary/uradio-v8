
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";

const PlaylistPage: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [isPageReady, setIsPageReady] = useState(false);
  
  const { 
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    editStationByValue,
    removeStationByValue,
    toggleFavorite
  } = useTrackStateContext();
  
  // Split stations into different categories - ensure proper filtering
  const userStations = tracks.filter(track => !track.isFeatured);
  const featuredStations = tracks.filter(track => track.isFeatured);
  const favoriteStations = tracks.filter(track => track.isFavorite);
  
  // Calculate popular stations based on play time
  const popularStations = [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);
  
  // Add effect for smooth transition on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;
  
  // Handle selecting a station from a grid with pause functionality
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    // Find the corresponding index in the full tracks list
    const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
    if (mainIndex !== -1) {
      // If clicking on the currently playing station, toggle pause/play
      if (mainIndex === currentIndex && isPlaying) {
        setIsPlaying(false);
      } else {
        setCurrentIndex(mainIndex);
        setIsPlaying(true);
      }
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
      <div className={`container mx-auto max-w-5xl space-y-6 transition-opacity duration-300 ease-in-out ${isPageReady ? 'opacity-100' : 'opacity-0'}`}>
        {/* Playlist Content Component - Player is now in header */}
        <PlaylistContent
          userStations={userStations}
          featuredStations={featuredStations}
          favoriteStations={favoriteStations}
          popularStations={popularStations}
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
