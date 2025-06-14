
import React, { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { Track } from "@/types/track";
import { useToast } from "@/hooks/use-toast";
import { PlaylistMusicPlayer } from "@/components/playlist/PlaylistMusicPlayer";
import FavoritesSection from "@/components/home/FavoritesSection";
import StationsTabsSection from "@/components/home/StationsTabsSection";
import HomePageDialogs from "@/components/home/HomePageDialogs";
import { getStations } from "@/data/featuredStationsLoader";

const Index: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  
  // Playlist-only state (separate from main track state)
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [playlistIsPlaying, setPlaylistIsPlaying] = useState(false);
  
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
  
  // Extract ONLY playlist stations
  const playlistStations = useMemo(() => {
    const filtered = tracks.filter(track => track.inPlaylist === true);
    console.log("Index - Playlist stations:", filtered.length, filtered.map(s => s.name));
    return filtered;
  }, [tracks]);

  // Sync playlist index when playlist changes
  React.useEffect(() => {
    if (playlistStations.length === 0) {
      setPlaylistIndex(0);
      setPlaylistIsPlaying(false);
    } else if (playlistIndex >= playlistStations.length) {
      setPlaylistIndex(0);
    }
  }, [playlistStations.length, playlistIndex]);
  
  // Get favorite and popular stations for the sections below
  const favoriteStations = tracks.filter(track => track.isFavorite);
  const popularStations = [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);
    
  const userStations = getUserStations();
  const featuredStations = getStations().map(station => ({
    ...station,
    isFavorite: false,
    isFeatured: true,
    playTime: 0
  }));

  // Handle selecting a station from any list (this updates the main app state)
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
    if (mainIndex !== -1) {
      setCurrentIndex(mainIndex);
      setIsPlaying(true);
      
      // If this station is in playlist, also update playlist player
      const station = tracks[mainIndex];
      if (station.inPlaylist) {
        const playlistIdx = playlistStations.findIndex(s => s.url === station.url);
        if (playlistIdx !== -1) {
          console.log("Station is in playlist, updating playlist index to:", playlistIdx);
          setPlaylistIndex(playlistIdx);
          setPlaylistIsPlaying(true);
        }
      }
    }
  };
  
  const handleToggleFavorite = (station: typeof tracks[0]) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      toggleFavorite(index);
    }
  };
  
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };
  
  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };
  
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
        {/* Playlist-Only Music Player */}
        <div className="mb-6">
          <PlaylistMusicPlayer
            playlistStations={playlistStations}
            currentPlaylistIndex={playlistIndex}
            setCurrentPlaylistIndex={setPlaylistIndex}
            isPlaying={playlistIsPlaying}
            setIsPlaying={setPlaylistIsPlaying}
          />
        </div>

        {/* Favorites Section */}
        <FavoritesSection 
          favoriteStations={favoriteStations}
          currentIndex={currentIndex}
          currentTrackUrl={tracks[currentIndex]?.url}
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
          currentTrackUrl={tracks[currentIndex]?.url}
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
