
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { loadTracksFromLocalStorage, saveTracksToLocalStorage, testLocalStorage } from "./trackStorage";

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
  const syncInProgress = useRef(false);
  
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
        }
        
        // Use a deep clone to ensure we're working with a fresh copy
        const freshTracks = JSON.parse(JSON.stringify(loadedTracks));
        tracksRef.current = freshTracks;
        setTracks(freshTracks);
        lastSavedTracksJSON.current = JSON.stringify(freshTracks);
      } else {
        // Initialize with empty array if no tracks found
        lastSavedTracksJSON.current = '[]';
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
    
    if (isInitialized && !syncInProgress.current) {
      // Only save if tracks have actually changed (prevents unnecessary writes)
      const currentTracksJSON = JSON.stringify(tracks);
      if (currentTracksJSON !== lastSavedTracksJSON.current) {
        if (isDevMode) {
          console.log("useTrackStateCore - Saving tracks to localStorage:", tracks.length);
        }
        
        // Mark that we need to save
        needsSaving.current = true;
        syncInProgress.current = true;
        
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
        
        syncInProgress.current = false;
      }
    }
  }, [tracks, isInitialized, isDevMode]);

  // Simplified integrity check that doesn't cause infinite loops
  useEffect(() => {
    if (!isInitialized) return;
    
    // Force save on page unload
    const handleBeforeUnload = () => {
      if (tracks.length > 0 && !syncInProgress.current) {
        if (isDevMode) {
          console.log("Page unloading - force saving tracks");
        }
        saveTracksToLocalStorage(tracks);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
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
