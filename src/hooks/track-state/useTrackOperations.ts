
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
  toggleTrackFavorite,
  toggleTrackInPlaylist
} from "./index";

export const useTrackOperations = (
  tracks: Track[],
  setTracks: (tracks: Track[] | ((prev: Track[]) => Track[])) => void,
  currentIndex: number,
  setCurrentIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void,
  tracksRef?: React.MutableRefObject<Track[]>
) => {
  const checkIfStationExists = useCallback((url: string) => {
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    return currentTracks.some(track => track.url.toLowerCase() === url.toLowerCase());
  }, [tracks, tracksRef]);

  const addUrl = useCallback((
    url: string, 
    name: string = "", 
    isFeatured: boolean = false, 
    isFavorite: boolean = false,
    language: string = "",
    inPlaylist: boolean = false,
    shouldAutoPlay: boolean = false
  ) => {
    console.log("addUrl called with:", { url, name, isFeatured, isFavorite, language, inPlaylist, shouldAutoPlay });
    
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    
    // FIXED: If adding to playlist, check if station already exists and just toggle inPlaylist
    if (inPlaylist) {
      const existingIndex = currentTracks.findIndex(
        track => track.url.toLowerCase() === url.toLowerCase()
      );
      
      if (existingIndex !== -1) {
        console.log("Found existing station at index:", existingIndex, "toggling inPlaylist to true");
        // Station exists, just toggle inPlaylist to true
        setTracks(prevTracks => {
          const updatedTracks = [...prevTracks];
          updatedTracks[existingIndex] = {
            ...updatedTracks[existingIndex],
            inPlaylist: true
          };
          
          // Save to localStorage
          saveTracksToLocalStorage(updatedTracks);
          if (tracksRef) {
            tracksRef.current = updatedTracks;
          }
          
          return updatedTracks;
        });
        
        // FIXED: Only auto-select and play if explicitly requested
        if (shouldAutoPlay) {
          console.log("Auto-playing existing station at index:", existingIndex);
          setCurrentIndex(existingIndex);
          setIsPlaying(true);
        }
        
        return { 
          success: true, 
          message: "Station added to playlist",
          addedIndex: existingIndex
        };
      }
    }
    
    // If not adding to playlist or station doesn't exist, use the original addStationUrl logic
    const { tracks: updatedTracks, result } = addStationUrl(
      url, name, isFeatured, isFavorite, currentTracks, language, inPlaylist
    );
    
    console.log("Result of addStationUrl:", result.success, result.message);
    console.log("Updated tracks count:", updatedTracks.length);
    
    if (updatedTracks.length > 0) {
      console.log("First track after update:", JSON.stringify(updatedTracks[0]));
      console.log("All tracks after update:", JSON.stringify(updatedTracks));
    }
    
    // Always update state with a completely fresh array
    setTracks([...updatedTracks]);
    
    // FIXED: Only auto-select and play if explicitly requested
    if (shouldAutoPlay && result.success && result.addedIndex !== undefined) {
      console.log("Auto-playing newly added station at index:", result.addedIndex);
      setCurrentIndex(result.addedIndex);
      setIsPlaying(true);
    } else {
      console.log("Station added but not auto-playing (shouldAutoPlay:", shouldAutoPlay, ")");
    }
    
    // Force an immediate save to localStorage
    const saveSuccess = saveTracksToLocalStorage(updatedTracks);
    if (!saveSuccess) {
      console.error("Failed to save tracks to localStorage after adding URL");
    }
    
    if (tracksRef) {
      tracksRef.current = updatedTracks;
    }
    
    return result;
  }, [tracks, setTracks, tracksRef, setCurrentIndex, setIsPlaying]);

  const updatePlayTime = useCallback((index: number, seconds: number) => {
    setTracks(currentTracks => {
      const updatedTracks = updateTrackPlayTime(currentTracks, index, seconds);
      
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      
      if (tracksRef) {
        tracksRef.current = updatedTracks;
      }
      
      return updatedTracks;
    });
  }, [setTracks, tracksRef]);

  const editTrack = useCallback((index: number, data: { url: string; name: string; language?: string }) => {
    console.log("Editing track at index:", index, "with data:", JSON.stringify(data));
    setTracks(currentTracks => {
      const updatedTracks = editTrackInfo(currentTracks, index, data);
      
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      
      if (tracksRef) {
        tracksRef.current = updatedTracks;
      }
      
      return updatedTracks;
    });
  }, [setTracks, tracksRef]);
  
  const editStationByValue = useCallback((station: Track, data: { url: string; name: string; language?: string }) => {
    console.log("Editing station by value:", JSON.stringify(station), "with data:", JSON.stringify(data));
    setTracks(currentTracks => {
      const updatedTracks = editByValue(currentTracks, station, data);
      
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      
      if (tracksRef) {
        tracksRef.current = updatedTracks;
      }
      
      return updatedTracks;
    });
  }, [setTracks, tracksRef]);
  
  const removeStationByValue = useCallback((station: Track) => {
    console.log("Removing station by value:", JSON.stringify(station));
    setTracks(currentTracks => {
      const updatedTracks = removeByValue(currentTracks, station);
      
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      
      if (tracksRef) {
        tracksRef.current = updatedTracks;
      }
      
      return updatedTracks;
    });
  }, [setTracks, tracksRef]);

  const removeUrl = useCallback((index: number) => {
    console.log("Removing track at index:", index);
    
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    
    const { tracks: updatedTracks, newCurrentIndex, shouldStopPlaying } = 
      removeTrackByIndex(currentTracks, index, currentIndex);
    
    console.log("Tracks after removal:", updatedTracks.length);
    console.log("New current index:", newCurrentIndex);
    
    setTracks([...updatedTracks]);
    setCurrentIndex(newCurrentIndex);
    
    if (shouldStopPlaying) {
      setIsPlaying(false);
    }
    
    // Force an immediate save to localStorage
    saveTracksToLocalStorage(updatedTracks);
    
    if (tracksRef) {
      tracksRef.current = updatedTracks;
    }
  }, [tracks, currentIndex, setTracks, setCurrentIndex, setIsPlaying, tracksRef]);

  const toggleFavorite = useCallback((index: number) => {
    console.log("Toggling favorite for index:", index);
    setTracks(currentTracks => {
      const updatedTracks = toggleTrackFavorite(currentTracks, index);
      
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      
      if (tracksRef) {
        tracksRef.current = updatedTracks;
      }
      
      return updatedTracks;
    });
  }, [setTracks, tracksRef]);

  const toggleInPlaylist = useCallback((index: number) => {
    setTracks(currentTracks => {
      const updatedTracks = toggleTrackInPlaylist(currentTracks, index);
      saveTracksToLocalStorage(updatedTracks);
      if (tracksRef) tracksRef.current = updatedTracks;
      return updatedTracks;
    });
  }, [setTracks, tracksRef]);

  // NEW: Bulk clear all from playlist
  const clearAllFromPlaylist = useCallback(() => {
    console.log("Clearing all stations from playlist");
    setTracks(currentTracks => {
      const updatedTracks = currentTracks.map(track => ({
        ...track,
        inPlaylist: false
      }));
      
      saveTracksToLocalStorage(updatedTracks);
      if (tracksRef) tracksRef.current = updatedTracks;
      return updatedTracks;
    });
  }, [setTracks, tracksRef]);

  return {
    addUrl,
    removeUrl,
    toggleFavorite,
    toggleInPlaylist,
    clearAllFromPlaylist,
    editTrack,
    updatePlayTime,
    checkIfStationExists,
    editStationByValue,
    removeStationByValue
  };
};
