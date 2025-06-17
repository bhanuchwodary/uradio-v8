
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
    
    // Find the corresponding index in the main library tracks for playback
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
  };
  
  // Edit station handler - edits the station in the main library
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };
  
  // Open the delete confirmation dialog for removing from playlist
  const handleConfirmDelete = (station: Track) => {
    setStationToDelete(station);
  };
  
  // Handle actual deletion from playlist only (not from library)
  const handleDeleteStation = (stationToDelete: Track | null) => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
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
      toggleFavorite(index);
    }
  };
  
  // Clear all stations from playlist only
  const handleClearAll = () => {
    setShowClearDialog(true);
  };
  
  // Confirm clearing all stations from playlist
  const confirmClearAll = () => {
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
