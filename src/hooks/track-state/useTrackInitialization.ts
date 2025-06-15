
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { loadTracksFromLocalStorage, testLocalStorage } from "./trackStorage";

export const useTrackInitialization = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for performance optimization
  const tracksRef = useRef<Track[]>([]);
  const lastSavedTracksJSON = useRef<string>('[]');
  
  // Debug counter to track render cycles
  const renderCount = useRef(0);
  const isDevMode = process.env.NODE_ENV === 'development';

  // Initialization effect - runs only once
  useEffect(() => {
    if (isDevMode) {
      console.log("useTrackInitialization - Initial load from localStorage");
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

  return {
    tracks,
    setTracks,
    tracksRef,
    lastSavedTracksJSON,
    isInitialized,
    renderCount,
    isDevMode
  };
};
