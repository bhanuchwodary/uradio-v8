
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { loadTracksFromLocalStorage, saveTracksToLocalStorage, testLocalStorage, verifySyncStatus } from "./trackStorage";
import { useTrackManagement } from "./useTrackManagement";
import { useTrackOperations } from "./useTrackOperations";
import { useTrackDebug } from "./useTrackDebug";

export const useTrackStateCore = () => {
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
          console.log("All loaded tracks:", JSON.stringify(loadedTracks));
        }
        
        // CRITICAL FIX: Use functional update to ensure we're using the latest state
        setTracks(() => [...loadedTracks]);
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
    console.log(`Current tracks in state (${tracks.length}):`, JSON.stringify(tracks));
    
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

  // Check state integrity periodically and on route changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const integrityCheck = setTimeout(() => {
      const isInSync = verifySyncStatus(tracks);
      if (!isInSync) {
        console.warn("Track state and localStorage are out of sync - forcing save");
        saveTracksToLocalStorage(tracks);
      }
    }, 1000);
    
    // Check integrity on component mount and route changes
    const handleRouteChange = () => {
      console.log("Route change detected - checking track state integrity");
      const isInSync = verifySyncStatus(tracks);
      if (!isInSync) {
        console.warn("Track state and localStorage are out of sync after route change - reloading from storage");
        const loadedTracks = loadTracksFromLocalStorage();
        if (loadedTracks.length > 0) {
          setTracks(loadedTracks);
        }
      }
    };
    
    // Listen for history changes as a proxy for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      clearTimeout(integrityCheck);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [tracks, isInitialized]);

  return {
    tracks,
    setTracks,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    stateVersion,
    needsSaving,
    renderCount,
    isInitialized
  };
};
