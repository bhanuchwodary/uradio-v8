
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { loadTracksFromLocalStorage, saveTracksToLocalStorage, testLocalStorage, verifySyncStatus } from "./trackStorage";

export const useTrackStateCore = () => {
  // Track state with a stable reference
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref to track whether the current state has been saved to localStorage
  const needsSaving = useRef(false);
  const stateVersion = useRef(0);
  const tracksRef = useRef<Track[]>([]);
  
  // Debug counter to track render cycles
  const renderCount = useRef(0);

  // Initialization effect - runs only once
  useEffect(() => {
    console.log("useTrackStateCore - Initial load from localStorage");
    renderCount.current++;
    
    // Test if localStorage is working properly
    const storageAvailable = testLocalStorage();
    console.log("LocalStorage is available:", storageAvailable);
    
    if (storageAvailable) {
      const loadedTracks = loadTracksFromLocalStorage();
      console.log("Initial tracks loaded from localStorage:", loadedTracks.length);
      
      if (loadedTracks && loadedTracks.length > 0) {
        console.log("First loaded track:", JSON.stringify(loadedTracks[0]));
        console.log("All loaded tracks:", JSON.stringify(loadedTracks));
        
        // CRITICAL FIX: Use a deep clone to ensure we're working with a fresh copy
        const freshTracks = JSON.parse(JSON.stringify(loadedTracks));
        tracksRef.current = freshTracks;
        setTracks(freshTracks);
      }
    }
    
    setIsInitialized(true);
    console.log("Track state initialized - render count:", renderCount.current);
  }, []);

  // Save tracks to localStorage whenever they change (but after initialization)
  useEffect(() => {
    renderCount.current++;
    stateVersion.current++;
    const currentVersion = stateVersion.current;
    
    // Update ref for direct access elsewhere
    tracksRef.current = tracks;
    
    console.log(`Tracks state changed - render count: ${renderCount.current}, state version: ${currentVersion}`);
    console.log(`Current tracks in state (${tracks.length}):`, JSON.stringify(tracks));
    
    if (isInitialized) {
      console.log("useTrackStateCore - Saving tracks to localStorage:", tracks.length);
      
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

  // Setup a more aggressive state integrity verification system
  useEffect(() => {
    if (!isInitialized) return;
    
    // Verify state integrity every second
    const integrityCheckInterval = setInterval(() => {
      const isInSync = verifySyncStatus(tracks);
      if (!isInSync) {
        console.warn("Track state and localStorage out of sync - resyncing");
        const storedTracks = loadTracksFromLocalStorage();
        
        // Only update if there are stored tracks and they differ from current tracks
        if (storedTracks && storedTracks.length > 0 && 
            JSON.stringify(storedTracks) !== JSON.stringify(tracks)) {
          console.log("Reloading tracks from storage during integrity check");
          setTracks(storedTracks);
        } else {
          // If storage is empty but we have tracks, force-save our tracks
          if (tracks.length > 0) {
            console.log("Forcing save of current tracks to storage");
            saveTracksToLocalStorage(tracks);
          }
        }
      }
    }, 1000);
    
    // Check integrity on route changes
    const handleRouteChange = () => {
      console.log("Route change detected - checking track state integrity");
      const isInSync = verifySyncStatus(tracks);
      if (!isInSync) {
        console.warn("Track state and localStorage are out of sync after route change - resyncing");
        const loadedTracks = loadTracksFromLocalStorage();
        if (loadedTracks && loadedTracks.length > 0) {
          setTracks(loadedTracks);
        } else if (tracks.length > 0) {
          // If storage is empty but we have tracks, save our tracks
          saveTracksToLocalStorage(tracks);
        }
      }
    };
    
    // Force save on page unload
    const handleBeforeUnload = () => {
      if (tracks.length > 0) {
        console.log("Page unloading - force saving tracks");
        saveTracksToLocalStorage(tracks);
      }
    };
    
    // Listen for history changes as a proxy for route changes
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(integrityCheckInterval);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tracks, isInitialized]);

  return {
    tracks,
    setTracks,
    tracksRef,
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
