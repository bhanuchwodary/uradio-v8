
import { useState } from "react";
import { useTrackInitialization } from "./useTrackInitialization";
import { useTrackStatePersistence } from "./useTrackStatePersistence";
import { useTrackStateDebugCore } from "./useTrackStateDebugCore";

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
