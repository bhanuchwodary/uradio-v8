import { useState, useEffect, useCallback, useRef } from "react";
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
  testLocalStorage,
  verifySyncStatus
} from "./track-state/trackStorage";

export const useTrackState = (): TrackStateResult => {
  // Track state
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to track whether the current state has been saved to localStorage
  const needsSaving = useRef(false);
  const stateVersion = useRef(0);
  
  // Debug counter to track render cycles
  const renderCount = useRef(0);

  // Initialization effect - runs only once
  useEffect(() => {
    if (!isInitialized) {
      console.log("useTrackState - Initial load from localStorage");
      renderCount.current++;
      
      // Test if localStorage is working properly
      const storageAvailable = testLocalStorage();
      console.log("LocalStorage is available:", storageAvailable);
      
      if (storageAvailable) {
        const loadedTracks = loadTracksFromLocalStorage();
        console.log("Initial tracks loaded from localStorage:", loadedTracks.length);
        if (loadedTracks.length > 0) {
          console.log("First loaded track:", JSON.stringify(loadedTracks[0]));
        }
        setTracks(loadedTracks);
      }
      
      setIsInitialized(true);
      console.log("Track state initialized - render count:", renderCount.current);
    }
  }, []);

  // Save tracks to localStorage whenever they change (but after initialization)
  useEffect(() => {
    renderCount.current++;
    stateVersion.current++;
    const currentVersion = stateVersion.current;
    
    console.log(`Tracks state changed - render count: ${renderCount.current}, state version: ${currentVersion}`);
    
    if (isInitialized) {
      console.log("useTrackState - Saving tracks to localStorage:", tracks.length);
      
      // Mark that we need to save
      needsSaving.current = true;
      
      // Save immediately to prevent losing data during navigation
      const saveSuccess = saveTracksToLocalStorage(tracks);
      if (saveSuccess) {
        needsSaving.current = false;
        console.log(`Successfully saved tracks (version ${currentVersion}) to localStorage`);
      } else {
        console.error(`Failed to save tracks (version ${currentVersion}) to localStorage`);
      }
    }
  }, [tracks, isInitialized]);

  // Check state integrity periodically
  useEffect(() => {
    if (!isInitialized) return;
    
    const integrityCheck = setTimeout(() => {
      const isInSync = verifySyncStatus(tracks);
      if (!isInSync) {
        console.warn("Track state and localStorage are out of sync - forcing save");
        saveTracksToLocalStorage(tracks);
      }
    }, 2000);
    
    return () => clearTimeout(integrityCheck);
  }, [tracks, isInitialized]);

  const checkIfStationExists = useCallback((url: string) => {
    return checkExists(url, tracks);
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
    }
    
    // Only update state if there was actually a change
    if (updatedTracks !== tracks) {
      console.log("Setting new tracks state with", updatedTracks.length, "tracks");
      
      // Update state with new tracks
      setTracks(updatedTracks);
      
      // Force an immediate save to localStorage
      const saveSuccess = saveTracksToLocalStorage(updatedTracks);
      if (!saveSuccess) {
        console.error("Failed to save tracks to localStorage after adding URL");
      }
      needsSaving.current = false;
    } else {
      console.log("No change to tracks state");
    }
    
    return result;
  }, [tracks]);

  const updatePlayTime = useCallback((index: number, seconds: number) => {
    setTracks(currentTracks => {
      const updatedTracks = updateTrackPlayTime(currentTracks, index, seconds);
      return updatedTracks;
    });
  }, []);

  const editTrack = useCallback((index: number, data: { url: string; name: string }) => {
    console.log("Editing track at index:", index, "with data:", JSON.stringify(data));
    setTracks(currentTracks => {
      const updatedTracks = editTrackInfo(currentTracks, index, data);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, []);
  
  const editStationByValue = useCallback((station: Track, data: { url: string; name: string }) => {
    console.log("Editing station by value:", JSON.stringify(station), "with data:", JSON.stringify(data));
    setTracks(currentTracks => {
      const updatedTracks = editByValue(currentTracks, station, data);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, []);
  
  const removeStationByValue = useCallback((station: Track) => {
    console.log("Removing station by value:", JSON.stringify(station));
    setTracks(currentTracks => {
      const updatedTracks = removeByValue(currentTracks, station);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, []);

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
  }, [tracks, currentIndex]);

  const toggleFavorite = useCallback((index: number) => {
    console.log("Toggling favorite for index:", index);
    setTracks(currentTracks => {
      const updatedTracks = toggleTrackFavorite(currentTracks, index);
      // Force an immediate save to localStorage
      saveTracksToLocalStorage(updatedTracks);
      return updatedTracks;
    });
  }, []);

  // Function to debug the current state
  const debugState = useCallback(() => {
    console.log("---- TRACK STATE DEBUG ----");
    console.log("Total tracks:", tracks.length);
    console.log("Current index:", currentIndex);
    console.log("Is playing:", isPlaying);
    console.log("Is initialized:", isInitialized);
    console.log("Need saving:", needsSaving.current);
    console.log("State version:", stateVersion.current);
    
    if (tracks.length > 0) {
      console.log("First few tracks:");
      tracks.slice(0, Math.min(3, tracks.length)).forEach((track, idx) => {
        console.log(`[${idx}]`, JSON.stringify(track));
      });
    }
    
    const localStorageStatus = testLocalStorage();
    console.log("localStorage working:", localStorageStatus);
    
    if (localStorageStatus) {
      console.log("localStorage/state in sync:", verifySyncStatus(tracks));
    }
    
    console.log("---------------------------");
    
    return {
      tracksCount: tracks.length,
      isInitialized,
      localStorageWorking: localStorageStatus,
      stateVersion: stateVersion.current
    };
  }, [tracks, currentIndex, isPlaying, isInitialized]);

  // Return the public interface
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
    removeStationByValue,
    debugState
  };
};
