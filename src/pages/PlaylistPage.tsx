
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { usePlaylistSearch } from "@/hooks/playlist/usePlaylistSearch";
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
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const { editStationByValue, toggleFavorite, tracks, addUrl } = useTrackStateContext();
  
  // Get playlist state with sorted tracks (favorites first)
  const {
    sortedPlaylistTracks,
    removeFromPlaylist,
    clearPlaylist,
    updatePlaylistTrackFavorite
  } = usePlaylist();

  // Filter tracks based on search term
  const filteredTracks = usePlaylistSearch(sortedPlaylistTracks, searchTerm);

  // Get audio player state - THIS IS THE SINGLE SOURCE OF TRUTH
  const {
    currentTrack,
    isPlaying,
    playTrack,
    pausePlayback,
    togglePlayPause,
    clearCurrentTrack,
    setPlaylistTracks,
    setRandomMode: setPlayerRandomMode
  } = useAudioPlayer();

  // Update the audio player's playlist tracks whenever sortedPlaylistTracks changes
  useEffect(() => {
    console.log("PlaylistPage: Updating audio player playlist tracks:", sortedPlaylistTracks.length);
    setPlaylistTracks(sortedPlaylistTracks);
  }, [sortedPlaylistTracks, setPlaylistTracks]);

  // Sync random mode between page state and player
  useEffect(() => {
    console.log("PlaylistPage: Syncing randomMode to player:", randomMode);
    setPlayerRandomMode(randomMode);
  }, [randomMode, setPlayerRandomMode]);

  console.log("PLAYLIST DEBUG: Current tracks:", sortedPlaylistTracks.length);
  console.log("PLAYLIST DEBUG: Filtered tracks:", filteredTracks.length);

  // Handle selecting a station for playback - use the global playTrack function
  const handleSelectStation = (index: number) => {
    const selectedStation = filteredTracks[index];
    if (selectedStation) {
      console.log("PlaylistPage: User selected station", selectedStation.name, "with random mode:", randomMode);
      console.log("PlaylistPage: Calling playTrack with station:", selectedStation);
      playTrack(selectedStation);
    }
  };

  // Handle play/pause for station cards - use the global functions
  const handleStationCardPlay = (station: Track) => {
    console.log("PlaylistPage: Station card play clicked for:", station.name);
    
    // If this station is already playing, toggle pause/play
    if (currentTrack?.url === station.url) {
      console.log("PlaylistPage: Station is current track, toggling play/pause");
      togglePlayPause();
    } else {
      // Play the new station
      console.log("PlaylistPage: Playing new station:", station.name);
      playTrack(station);
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
    console.log("FAVORITES DEBUG: Toggling favorite for:", station.name, "Current state:", station.isFavorite);
    
    // Find the station in the main library
    let stationIndex = tracks.findIndex(t => t.url === station.url);
    
    // If station is not in main library (likely a featured station), add it first
    if (stationIndex === -1) {
      console.log("FAVORITES DEBUG: Station not found in main library, adding it first");
      
      const addResult = addUrl(
        station.url,
        station.name,
        station.isFeatured || false,
        !station.isFavorite, // Toggle the favorite state when adding
        station.language || ""
      );
      
      if (addResult.success) {
        console.log("FAVORITES DEBUG: Successfully added station to main library with favorite state:", !station.isFavorite);
        
        // Update the playlist track favorite status to match the new state
        updatePlaylistTrackFavorite(station.url, !station.isFavorite);
        
        toast({
          title: !station.isFavorite ? "Added to favorites" : "Removed from favorites",
          description: `${station.name} ${!station.isFavorite ? "added to" : "removed from"} favorites`
        });
      } else {
        console.log("FAVORITES DEBUG: Failed to add station to main library:", addResult.message);
        toast({
          title: "Error",
          description: addResult.message,
          variant: "destructive"
        });
      }
    } else {
      // Station exists in main library, toggle normally
      console.log("FAVORITES DEBUG: Station found in main library at index:", stationIndex);
      
      // Toggle favorite in main library first
      toggleFavorite(stationIndex);
      
      // Get the updated favorite state after toggle
      const updatedFavoriteState = !station.isFavorite;
      
      console.log("FAVORITES DEBUG: New favorite state:", updatedFavoriteState);
      
      // Update the playlist track favorite status to match
      updatePlaylistTrackFavorite(station.url, updatedFavoriteState);
      
      console.log("FAVORITES DEBUG: Updated both main library and playlist");
      
      toast({
        title: updatedFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: `${station.name} ${updatedFavoriteState ? "added to" : "removed from"} favorites`
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
          playlistTracks={filteredTracks}
          allPlaylistTracks={sortedPlaylistTracks}
          currentIndex={-1}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          randomMode={randomMode}
          onRandomModeChange={setRandomMode}
          onSelectStation={handleSelectStation}
          onStationCardPlay={handleStationCardPlay}
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
