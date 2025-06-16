
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

  // Enhanced setters with validation
  const setCurrentIndexSafe = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentIndex(index);
    } else {
      logger.warn("Invalid track index", { index, tracksLength: tracks.length });
    }
  };

  return {
    tracks: memoizedTracks,
    setTracks,
    tracksRef,
    currentIndex,
    setCurrentIndex: setCurrentIndexSafe,
    isPlaying,
    setIsPlaying,
    stateVersion,
    needsSaving,
    renderCount,
    isInitialized
  };
};
