
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { loadTracksFromLocalStorage, saveTracksToLocalStorage, testLocalStorage, verifySyncStatus } from "./trackStorage";

export const useTrackStateCore = () => {
  // Track state with a stable reference
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for performance optimization
  const needsSaving = useRef(false);
  const stateVersion = useRef(0);
  const tracksRef = useRef<Track[]>([]);
  const lastSavedTracksJSON = useRef<string>('[]');
  
  // Debug counter to track render cycles
  const renderCount = useRef(0);
  const isDevMode = process.env.NODE_ENV === 'development';

  // Initialization effect - runs only once
  useEffect(() => {
    if (isDevMode) {
      console.log("useTrackStateCore - Initial load from localStorage");
      renderCount.current++;
    }
    
    // Test if localStorage is working properly
    const storageAvailable = testLocalStorage();
    if (isDevMode) {
      console.log("LocalStorage is available:", storageAvailable);
    }
    
    if (storageAvailable) {
      const loadedTracks = loadTracksFromLocalStorage();
      if (isDevMode) {
        console.log("Initial tracks loaded from localStorage:", loadedTracks.length);
      }
      
      if (loadedTracks && loadedTracks.length > 0) {
        if (isDevMode) {
          console.log("First loaded track:", JSON.stringify(loadedTracks[0]));
          console.log("All loaded tracks:", JSON.stringify(loadedTracks));
        }
        
        // CRITICAL FIX: Use a deep clone to ensure we're working with a fresh copy
        const freshTracks = JSON.parse(JSON.stringify(loadedTracks));
        tracksRef.current = freshTracks;
        setTracks(freshTracks);
        lastSavedTracksJSON.current = JSON.stringify(freshTracks);
      }
    }
    
    setIsInitialized(true);
    if (isDevMode) {
      console.log("Track state initialized - render count:", renderCount.current);
    }
  }, [isDevMode]);

  // Save tracks to localStorage whenever they change (but after initialization)
  useEffect(() => {
    if (isDevMode) {
      renderCount.current++;
      stateVersion.current++;
      const currentVersion = stateVersion.current;
      console.log(`Tracks state changed - render count: ${renderCount.current}, state version: ${currentVersion}`);
      console.log(`Current tracks in state (${tracks.length}):`, JSON.stringify(tracks));
    }
    
    // Update ref for direct access elsewhere
    tracksRef.current = tracks;
    
    if (isInitialized) {
      // Only save if tracks have actually changed (prevents unnecessary writes)
      const currentTracksJSON = JSON.stringify(tracks);
      if (currentTracksJSON !== lastSavedTracksJSON.current) {
        if (isDevMode) {
          console.log("useTrackStateCore - Saving tracks to localStorage:", tracks.length);
        }
        
        // Mark that we need to save
        needsSaving.current = true;
        
        // Save immediately to prevent losing data during navigation
        const saveSuccess = saveTracksToLocalStorage(tracks);
        if (saveSuccess) {
          needsSaving.current = false;
          lastSavedTracksJSON.current = currentTracksJSON;
          if (isDevMode) {
            console.log(`Successfully saved tracks to localStorage`);
          }
        } else if (isDevMode) {
          console.error(`Failed to save tracks to localStorage`);
        }
      }
    }
  }, [tracks, isInitialized, isDevMode]);

  // Setup a more efficient state integrity verification system
  useEffect(() => {
    if (!isInitialized) return;
    
    // Use a less frequent interval to reduce performance impact
    const integrityCheckInterval = setInterval(() => {
      const isInSync = verifySyncStatus(tracks);
      if (!isInSync) {
        if (isDevMode) {
          console.warn("Track state and localStorage out of sync - resyncing");
        }
        const storedTracks = loadTracksFromLocalStorage();
        
        // Only update if there are stored tracks and they differ from current tracks
        if (storedTracks && storedTracks.length > 0 && 
            JSON.stringify(storedTracks) !== JSON.stringify(tracks)) {
          if (isDevMode) {
            console.log("Reloading tracks from storage during integrity check");
          }
          setTracks(storedTracks);
        } else {
          // If storage is empty but we have tracks, force-save our tracks
          if (tracks.length > 0) {
            if (isDevMode) {
              console.log("Forcing save of current tracks to storage");
            }
            saveTracksToLocalStorage(tracks);
          }
        }
      }
    }, 5000); // Check less frequently (5 seconds) for better performance
    
    // Check integrity on route changes
    const handleRouteChange = () => {
      if (isDevMode) {
        console.log("Route change detected - checking track state integrity");
      }
      const isInSync = verifySyncStatus(tracks);
      if (!isInSync) {
        if (isDevMode) {
          console.warn("Track state and localStorage are out of sync after route change - resyncing");
        }
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
        if (isDevMode) {
          console.log("Page unloading - force saving tracks");
        }
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
  }, [tracks, isInitialized, isDevMode]);

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
