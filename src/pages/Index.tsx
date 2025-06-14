
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
  
  // Playlist-only state (completely separate from main track state)
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [playlistIsPlaying, setPlaylistIsPlaying] = useState(false);
  
  const { 
    tracks, 
    editStationByValue,
    removeStationByValue,
    toggleFavorite,
    getUserStations
  } = useTrackStateContext();
  
  // Extract ONLY playlist stations for the playlist player
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
  
  // Get stations for display sections (no playback functionality)
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

  // REMOVED: handleSelectStation - stations in sections are for display only
  // Only the playlist player handles actual playback
  
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

  // Dummy handler for display sections - they don't trigger playback
  const handleDisplayStationClick = (index: number, stationList: Track[]) => {
    console.log("Display section clicked - no playback triggered");
    toast({
      title: "Station Display",
      description: "Use the Station List page to add stations to your playlist",
    });
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Playlist-Only Music Player - ONLY source of music playback */}
        <div className="mb-6">
          <PlaylistMusicPlayer
            playlistStations={playlistStations}
            currentPlaylistIndex={playlistIndex}
            setCurrentPlaylistIndex={setPlaylistIndex}
            isPlaying={playlistIsPlaying}
            setIsPlaying={setPlaylistIsPlaying}
          />
        </div>

        {/* Favorites Section - DISPLAY ONLY */}
        <FavoritesSection 
          favoriteStations={favoriteStations}
          currentIndex={-1} // No current index for display
          currentTrackUrl="" // No current track for display
          isPlaying={false} // Never playing from display
          onSelectStation={handleDisplayStationClick}
          onToggleFavorite={handleToggleFavorite}
          onDeleteStation={handleConfirmDelete}
        />
        
        {/* All Stations Section with Tabs - DISPLAY ONLY */}
        <StationsTabsSection
          popularStations={popularStations}
          userStations={userStations}
          featuredStations={featuredStations}
          currentIndex={-1} // No current index for display
          currentTrackUrl="" // No current track for display
          isPlaying={false} // Never playing from display
          onSelectStation={handleDisplayStationClick}
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
