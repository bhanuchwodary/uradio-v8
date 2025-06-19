
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";
import ClearAllDialog from "@/components/playlist/ClearAllDialog";
import { Track } from "@/types/track";

interface PlaylistPageProps {
  randomMode: boolean;
  setRandomMode: (rand: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({
  randomMode,
  setRandomMode,
  volume,
  setVolume
}) => {
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const { toast } = useToast();
  const { editStationByValue, toggleFavorite, tracks } = useTrackStateContext();
  
  // Get playlist state
  const {
    sortedPlaylistTracks,
    removeFromPlaylist,
    clearPlaylist,
    updatePlaylistTrackFavorite
  } = usePlaylist();

  // Get audio player state
  const {
    currentTrack,
    isPlaying,
    playTrack,
    clearCurrentTrack
  } = useAudioPlayer();

  console.log("PlaylistPage: Random mode is", randomMode);

  // Handle selecting a station for playback
  const handleSelectStation = (index: number) => {
    const selectedStation = sortedPlaylistTracks[index];
    if (selectedStation) {
      console.log("PlaylistPage: User selected station", selectedStation.name, "with random mode:", randomMode);
      playTrack(selectedStation);
    }
  };

  // Edit station handler
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };

  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };

  const handleDeleteStation = (stationToDelete: Track | null) => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
      
      // Check if this is the currently playing station
      const isCurrentlyPlaying = currentTrack?.url === stationToDelete.url;
      
      const success = removeFromPlaylist(stationToDelete.url);
      if (success) {
        // If we removed the currently playing station, clear it from player
        if (isCurrentlyPlaying) {
          clearCurrentTrack();
        }
        
        toast({
          title: "Station removed from playlist",
          description: `${stationName} has been removed from your playlist`
        });
      }
    }
  };

  const handleToggleFavorite = (station: Track) => {
    // Find the station in the main library
    const stationIndex = tracks.findIndex(t => t.url === station.url);
    
    if (stationIndex !== -1) {
      // Toggle favorite in the main library
      toggleFavorite(stationIndex);
      
      // Update the playlist track favorite status
      updatePlaylistTrackFavorite(station.url, !station.isFavorite);
      
      toast({
        title: !station.isFavorite ? "Added to favorites" : "Removed from favorites",
        description: `${station.name} ${!station.isFavorite ? "added to" : "removed from"} favorites`
      });
    }
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = () => {
    // Check if currently playing station is in the playlist being cleared
    const isCurrentInPlaylist = currentTrack && sortedPlaylistTracks.some(t => t.url === currentTrack.url);
    
    const removedCount = clearPlaylist();
    
    // If the currently playing station was in the playlist, clear it from player
    if (isCurrentInPlaylist) {
      clearCurrentTrack();
    }
    
    toast({
      title: "Playlist cleared",
      description: `${removedCount} stations removed from your playlist`
    });
    setShowClearDialog(false);
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
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        <PlaylistContent
          playlistTracks={sortedPlaylistTracks}
          currentIndex={-1}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onEditStation={handleEditStation}
          onConfirmDelete={handleConfirmDelete}
          onToggleFavorite={handleToggleFavorite}
          onClearAll={handleClearAll}
        />

        <PlaylistDialogs
          editingStation={editingStation}
          onCloseEditDialog={() => setEditingStation(null)}
          onSaveEdit={handleSaveEdit}
          stationToDelete={stationToDelete}
          onCloseDeleteDialog={() => setStationToDelete(null)}
          onConfirmDelete={() => handleDeleteStation(stationToDelete)}
        />

        <ClearAllDialog
          isOpen={showClearDialog}
          onClose={() => setShowClearDialog(false)}
          onConfirm={confirmClearAll}
        />
      </div>
    </AppLayout>
  );
};

export default PlaylistPage;
