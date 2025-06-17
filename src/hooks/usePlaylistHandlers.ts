
import { Track } from "@/types/track";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { updateGlobalPlaybackState, setNavigationState } from "@/components/music-player/audioInstance";

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
    const mainIndex = tracks.findIndex(t => t.url === selectedStation.url);
    
    console.log("Found station in main library at index:", mainIndex);
    
    if (mainIndex !== -1) {
      // CRITICAL FIX: Reset navigation and explicit pause states for immediate playback
      setNavigationState(false);
      updateGlobalPlaybackState(false, false, false);
      
      console.log("User explicitly selected station for playback - resetting audio state");
      
      // CRITICAL FIX: If clicking on the currently playing station, toggle pause/play
      if (mainIndex === currentIndex && isPlaying) {
        console.log("Pausing currently playing station");
        setIsPlaying(false);
      } else {
        console.log("Starting playback of station at index:", mainIndex);
        // Set the index first, then immediately trigger playback
        setCurrentIndex(mainIndex);
        // Use setTimeout to ensure index change is processed before playback
        setTimeout(() => {
          setIsPlaying(true);
        }, 50);
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
  
  const handleConfirmDelete = (station: Track) => {
    console.log("Confirming delete for playlist station:", station.name);
    setStationToDelete(station);
  };
  
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
  
  const handleToggleFavorite = (station: Track) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      console.log("Toggling favorite for station:", station.name);
      toggleFavorite(index);
    } else {
      console.warn("Station not found in main library for favorite toggle:", station.url);
    }
  };
  
  const handleClearAll = () => {
    console.log("Opening clear all dialog");
    setShowClearDialog(true);
  };
  
  const confirmClearAll = () => {
    console.log("Confirming clear all playlist");
    const removedCount = clearPlaylist();
    toast({
      title: "Playlist cleared",
      description: `${removedCount} stations removed from your playlist`
    });
    setShowClearDialog(false);
  };
  
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
