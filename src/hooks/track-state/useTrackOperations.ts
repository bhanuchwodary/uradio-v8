
import { useCallback } from "react";
import { Track } from "@/types/track";
import { saveTracksToLocalStorage } from "./trackStorage";
import { 
  addStationUrl, 
  updateTrackPlayTime, 
  editTrackInfo,
  editStationByValue as editByValue,
  removeStationByValue as removeByValue,
  removeTrackByIndex,
  toggleTrackFavorite
} from "./trackModifications";

export const useTrackOperations = (
  tracks: Track[],
  setTracks: (tracks: Track[] | ((prev: Track[]) => Track[])) => void,
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void
) => {
  const checkIfStationExists = useCallback((url: string) => {
    return tracks.some(track => track.url.toLowerCase() === url.toLowerCase());
  }, [tracks]);

  const addUrl = useCallback((
    url: string, 
    name: string = "", 
    isPrebuilt: boolean = false, 
    isFavorite: boolean = false
  ) => {
    console.log("addUrl called with:", url, name, isPrebuilt, isFavorite);
    
    const { tracks: updatedTracks, result } = addStationUrl(
      url, name, isPrebuilt, isFavorite, tracks
    );
    
    console.log("Result of addStationUrl:", result.success, result.message);
    console.log("Updated tracks count:", updatedTracks.length);
    
    if (updatedTracks.length > 0) {
      console.log("First track after update:", JSON.stringify(updatedTracks[0]));
      console.log("All tracks after update:", JSON.stringify(updatedTracks));
    }
    
    // Only update state if there was actually a change
    if (updatedTracks.length !== tracks.length || JSON.stringify(updatedTracks) !== JSON.stringify(tracks)) {
      console.log("Setting new tracks state with", updatedTracks.length, "tracks");
      
      // Use functional update to ensure we're using the latest state
      setTracks(() => [...updatedTracks]);
      
      // Force an immediate save to localStorage
      const saveSuccess = saveTracksToLocalStorage(updatedTracks);
      if (!saveSuccess) {
        console.error("Failed to save tracks to localStorage after adding URL");
      }
    } else {
      console.log("No change to tracks state");
    }
    
    return result;
  }, [tracks, setTracks]);

  const updatePlayTime = useCallback((index: number, seconds: number) => {
    setTracks(currentTracks => {
      const updatedTracks = updateTrackPlayTime(currentTracks, index, seconds);
      return updatedTracks;
    });
  }, [setTracks]);

  const editTrack = useCallback((index: number, data: { url: string; name: string }) => {
    console.log("Editing track at index:", index, "with data:", JSON.stringify(data));
    setTracks(currentTracks => {
      const updatedTracks = editTrackInfo(currentTracks, index, data);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, [setTracks]);
  
  const editStationByValue = useCallback((station: Track, data: { url: string; name: string }) => {
    console.log("Editing station by value:", JSON.stringify(station), "with data:", JSON.stringify(data));
    setTracks(currentTracks => {
      const updatedTracks = editByValue(currentTracks, station, data);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, [setTracks]);
  
  const removeStationByValue = useCallback((station: Track) => {
    console.log("Removing station by value:", JSON.stringify(station));
    setTracks(currentTracks => {
      const updatedTracks = removeByValue(currentTracks, station);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, [setTracks]);

  const removeUrl = useCallback((index: number) => {
    console.log("Removing track at index:", index);
    const { tracks: updatedTracks, newCurrentIndex, shouldStopPlaying } = 
      removeTrackByIndex(tracks, index, currentIndex);
    
    console.log("Tracks after removal:", updatedTracks.length);
    console.log("New current index:", newCurrentIndex);
    
    setTracks(updatedTracks);
    setCurrentIndex(newCurrentIndex);
    
    if (shouldStopPlaying) {
      setIsPlaying(false);
    }
    
    // Force an immediate save to localStorage
    saveTracksToLocalStorage(updatedTracks);
  }, [tracks, currentIndex, setTracks, setCurrentIndex, setIsPlaying]);

  const toggleFavorite = useCallback((index: number) => {
    console.log("Toggling favorite for index:", index);
    setTracks(currentTracks => {
      const updatedTracks = toggleTrackFavorite(currentTracks, index);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, [setTracks]);

  return {
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
    updatePlayTime,
    checkIfStationExists,
    editStationByValue,
    removeStationByValue
  };
};
