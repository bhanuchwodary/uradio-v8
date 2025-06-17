
import { useState, useMemo } from "react";
import { useTrackInitialization } from "./useTrackInitialization";
import { useTrackStatePersistence } from "./useTrackStatePersistence";
import { useTrackStateDebugCore } from "./useTrackStateDebugCore";
import { logger } from "@/utils/logger";

export const useTrackStateCore = () => {
  // Basic state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize tracks and get refs
  const {
    tracks,
    setTracks,
    tracksRef,
    lastSavedTracksJSON,
    isInitialized,
    renderCount,
    isDevMode
  } = useTrackInitialization();
  
  // Debug state
  const { stateVersion } = useTrackStateDebugCore();
  
  // Handle persistence
  const { needsSaving } = useTrackStatePersistence({
    tracks,
    isInitialized,
    lastSavedTracksJSON,
    tracksRef,
    isDevMode,
    renderCount,
    stateVersion
  });

  // Memoize expensive operations
  const memoizedTracks = useMemo(() => tracks, [tracks]);

  // Enhanced setters with validation and playback safeguards
  const setCurrentIndexSafe = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      console.log("Setting current index to:", index, "Track:", tracks[index]?.name);
      setCurrentIndex(index);
    } else {
      logger.warn("Invalid track index", { index, tracksLength: tracks.length });
      // CRITICAL FIX: Reset to safe state if invalid index
      if (tracks.length > 0) {
        setCurrentIndex(0);
      }
    }
  };

  // CRITICAL FIX: Enhanced setIsPlaying with intent validation
  const setIsPlayingSafe = (playing: boolean) => {
    // Only allow playback if we have valid tracks and current index
    if (playing && (tracks.length === 0 || currentIndex >= tracks.length || currentIndex < 0)) {
      logger.warn("Attempted to start playback with invalid state", { 
        tracksLength: tracks.length, 
        currentIndex 
      });
      return;
    }
    
    console.log("Setting playback state to:", playing, "Current track:", tracks[currentIndex]?.name);
    setIsPlaying(playing);
  };

  return {
    tracks: memoizedTracks,
    setTracks,
    tracksRef,
    currentIndex,
    setCurrentIndex: setCurrentIndexSafe,
    isPlaying,
    setIsPlaying: setIsPlayingSafe,
    stateVersion,
    needsSaving,
    renderCount,
    isInitialized
  };
};
