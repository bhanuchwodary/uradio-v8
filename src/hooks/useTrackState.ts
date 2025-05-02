import { useState, useEffect, useCallback } from "react";
import { Track } from "@/types/track";
import { TrackStateResult } from "./track-state/types";
import { 
  getUserStations, 
  getTopStations,
  checkIfStationExists as checkExists
} from "./track-state/trackUtils";
import { 
  addStationUrl, 
  updateTrackPlayTime, 
  editTrackInfo,
  editStationByValue as editByValue,
  removeStationByValue as removeByValue,
  removeTrackByIndex,
  toggleTrackFavorite
} from "./track-state/trackModifications";
import {
  loadTracksFromLocalStorage,
  saveTracksToLocalStorage,
  testLocalStorage
} from "./track-state/trackStorage";

export const useTrackState = (): TrackStateResult => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tracks from localStorage only once on initial render
  useEffect(() => {
    if (!isInitialized) {
      console.log("useTrackState - Loading tracks from localStorage");
      
      // Test if localStorage is working properly
      const storageAvailable = testLocalStorage();
      console.log("LocalStorage is available:", storageAvailable);
      
      if (storageAvailable) {
        const loadedTracks = loadTracksFromLocalStorage();
        console.log("Tracks loaded from localStorage:", loadedTracks.length);
        if (loadedTracks.length > 0) {
          console.log("First track:", loadedTracks[0].name);
        }
        setTracks(loadedTracks);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save tracks to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      console.log("useTrackState - Saving tracks to localStorage:", tracks.length);
      saveTracksToLocalStorage(tracks);
    }
  }, [tracks, isInitialized]);

  const checkIfStationExists = useCallback((url: string) => {
    return checkExists(url, tracks);
  }, [tracks]);

  const addUrl = useCallback((url: string, name: string = "", isPrebuilt: boolean = false, isFavorite: boolean = false) => {
    console.log("addUrl called with:", url, name, isPrebuilt, isFavorite);
    const { tracks: updatedTracks, result } = addStationUrl(url, name, isPrebuilt, isFavorite, tracks);
    
    console.log("Result of addStationUrl:", result.success, result.message);
    console.log("Updated tracks count:", updatedTracks.length);
    
    // Only update state if there was actually a change
    if (updatedTracks !== tracks) {
      setTracks(updatedTracks);
    }
    
    return result;
  }, [tracks]);

  const updatePlayTime = (index: number, seconds: number) => {
    setTracks(currentTracks => updateTrackPlayTime(currentTracks, index, seconds));
  };

  const editTrack = (index: number, data: { url: string; name: string }) => {
    setTracks(currentTracks => editTrackInfo(currentTracks, index, data));
  };
  
  const editStationByValue = (station: Track, data: { url: string; name: string }) => {
    setTracks(currentTracks => editByValue(currentTracks, station, data));
  };
  
  const removeStationByValue = (station: Track) => {
    setTracks(currentTracks => removeByValue(currentTracks, station));
  };

  const removeUrl = useCallback((index: number) => {
    console.log("Removing track at index:", index);
    const { tracks: updatedTracks, newCurrentIndex, shouldStopPlaying } = 
      removeTrackByIndex(tracks, index, currentIndex);
    
    console.log("Tracks after removal:", updatedTracks.length);
    setTracks(updatedTracks);
    setCurrentIndex(newCurrentIndex);
    
    if (shouldStopPlaying) {
      setIsPlaying(false);
    }
  }, [tracks, currentIndex]);

  const toggleFavorite = useCallback((index: number) => {
    setTracks(currentTracks => toggleTrackFavorite(currentTracks, index));
  }, []);

  return {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
    updatePlayTime,
    getTopStations: () => getTopStations(tracks),
    getUserStations: () => getUserStations(tracks),
    checkIfStationExists,
    editStationByValue,
    removeStationByValue
  };
};
