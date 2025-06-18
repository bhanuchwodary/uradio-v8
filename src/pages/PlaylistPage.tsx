
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import PlaylistDialogs from "@/components/playlist/PlaylistDialogs";
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
  const { editStationByValue } = useTrackStateContext();
  
  // Get playlist state
  const {
    playlistTracks,
    removeFromPlaylist,
    clearPlaylist
  } = usePlaylist();

  // Get audio player state
  const {
    currentTrack,
    isPlaying,
    playTrack,
    clearCurrentTrack
  } = useAudioPlayer();

  // Handle selecting a station for playback
  const handleSelectStation = (index: number) => {
    const selectedStation = playlistTracks[index];
    if (selectedStation) {
      // CRITICAL: Only start playback when user explicitly clicks
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
    // This toggles favorite in the main library, not just playlist
    toast({
      title: station.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `${station.name} ${station.isFavorite ? "removed from" : "added to"} favorites`
    });
  };

  const handleClearAll = () => {
    setShowClearDialog(true);
  };

  const confirmClearAll = () => {
    // Check if currently playing station is in the playlist being cleared
    const isCurrentInPlaylist = currentTrack && playlistTracks.some(t => t.url === currentTrack.url);
    
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
          playlistTracks={playlistTracks}
          currentIndex={-1} // Not needed anymore since we track by URL
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
      </div>
    </AppLayout>
  );
};

export default PlaylistPage;
