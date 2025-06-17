
import { Track } from "@/types/track";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";

interface UsePlaylistHandlersProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  toggleFavorite: (index: number) => void;
  setEditingStation: (station: Track | null) => void;
  setStationToDelete: (station: Track | null) => void;
  setShowClearDialog: (show: boolean) => void;
  // Playlist-specific handlers
  playlistTracks: Track[];
  removeFromPlaylist: (trackUrl: string) => boolean;
  clearPlaylist: () => number;
}

export const usePlaylistHandlers = ({
  tracks,
  currentIndex,
  isPlaying,
  setCurrentIndex,
  setIsPlaying,
  toggleFavorite,
  setEditingStation,
  setStationToDelete,
  setShowClearDialog,
  playlistTracks,
  removeFromPlaylist,
  clearPlaylist
}: UsePlaylistHandlersProps) => {
  const { toast } = useToast();
  const { editStationByValue } = useTrackStateContext();

  // Handle selecting a station from playlist for playback
  const handleSelectStation = (stationIndex: number, stationList: typeof playlistTracks) => {
    const selectedStation = stationList[stationIndex];
    
    console.log("Playlist station selected:", selectedStation.name, "URL:", selectedStation.url);
    
    // CRITICAL FIX: Find the corresponding index in the main library tracks for playback
    // This ensures both featured and user stations can be played
    const mainIndex = tracks.findIndex(t => t.url === selectedStation.url);
    
    console.log("Found station in main library at index:", mainIndex);
    
    if (mainIndex !== -1) {
      // CRITICAL FIX: Add explicit user intent check for playback
      // If clicking on the currently playing station, toggle pause/play
      if (mainIndex === currentIndex && isPlaying) {
        console.log("Pausing currently playing station");
        setIsPlaying(false);
      } else {
        console.log("Starting playback of station at index:", mainIndex);
        setCurrentIndex(mainIndex);
        setIsPlaying(true);
      }
    } else {
      // This should not happen after our playlist core fix, but add safety
      console.error("Station not found in main library:", selectedStation.url);
      toast({
        title: "Playback Error",
        description: "Station not available for playback. Please try adding it again.",
        variant: "destructive"
      });
    }
  };
  
  // Edit station handler - edits the station in the main library
  const handleEditStation = (station: Track) => {
    console.log("Opening edit dialog for station:", station.name);
    setEditingStation(station);
  };
  
  // Open the delete confirmation dialog for removing from playlist
  const handleConfirmDelete = (station: Track) => {
    console.log("Confirming delete for playlist station:", station.name);
    setStationToDelete(station);
  };
  
  // Handle actual deletion from playlist only (not from library)
  const handleDeleteStation = (stationToDelete: Track | null) => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
      console.log("Removing station from playlist:", stationName);
      const success = removeFromPlaylist(stationToDelete.url);
      if (success) {
        toast({
          title: "Station removed from playlist",
          description: `${stationName} has been removed from your playlist`
        });
      }
    }
  };
  
  // Toggle favorite for a station in the main library
  const handleToggleFavorite = (station: Track) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      console.log("Toggling favorite for station:", station.name);
      toggleFavorite(index);
    } else {
      console.warn("Station not found in main library for favorite toggle:", station.url);
    }
  };
  
  // Clear all stations from playlist only
  const handleClearAll = () => {
    console.log("Opening clear all dialog");
    setShowClearDialog(true);
  };
  
  // Confirm clearing all stations from playlist
  const confirmClearAll = () => {
    console.log("Confirming clear all playlist");
    const removedCount = clearPlaylist();
    toast({
      title: "Playlist cleared",
      description: `${removedCount} stations removed from your playlist`
    });
    setShowClearDialog(false);
  };
  
  // Save edited station in the main library
  const handleSaveEdit = (data: { url: string; name: string }, editingStation: Track | null) => {
    if (editingStation) {
      console.log("Saving station edit:", data.name);
      editStationByValue(editingStation, data);
      toast({
        title: "Station updated",
        description: `"${data.name}" has been updated`,
      });
      setEditingStation(null);
    }
  };

  return {
    handleSelectStation,
    handleEditStation,
    handleConfirmDelete,
    handleDeleteStation,
    handleToggleFavorite,
    handleClearAll,
    confirmClearAll,
    handleSaveEdit
  };
};
