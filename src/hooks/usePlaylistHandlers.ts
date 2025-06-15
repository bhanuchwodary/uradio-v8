
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
  setShowClearDialog
}: UsePlaylistHandlersProps) => {
  const { toast } = useToast();
  const { editStationByValue, removeStationByValue } = useTrackStateContext();

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
  const handleDeleteStation = (stationToDelete: Track | null) => {
    if (stationToDelete) {
      const stationName = stationToDelete.name;
      removeStationByValue(stationToDelete);
      toast({
        title: "Station removed",
        description: `${stationName} has been removed from your playlist`
      });
    }
  };
  
  // Toggle favorite for a station
  const handleToggleFavorite = (station: Track) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      toggleFavorite(index);
    }
  };
  
  // Clear all stations from playlist
  const handleClearAll = () => {
    setShowClearDialog(true);
  };
  
  // FIXED: Clear all function now properly removes ALL stations from the playlist only
  const confirmClearAll = () => {
    // Get count before clearing
    const stationCount = tracks.length;
    
    // Remove ALL stations from the tracks array (this is the playlist)
    const allStationsToRemove = [...tracks];
    allStationsToRemove.forEach(station => {
      removeStationByValue(station);
    });
    
    toast({
      title: "Playlist cleared",
      description: `${stationCount} stations removed from your playlist`
    });
    setShowClearDialog(false);
  };
  
  // Save edited station
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
