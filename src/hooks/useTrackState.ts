
import { useTrackStateCore } from "./track-state/useTrackStateCore";
import { useTrackOperations } from "./track-state/useTrackOperations";
import { useTrackManagement } from "./track-state/useTrackManagement";
import { useTrackDebug } from "./track-state/useTrackDebug";
import { TrackStateResult } from "./track-state/types";

export const useTrackState = (): TrackStateResult => {
  // Get core state management with the tracksRef for direct access
  const {
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
  } = useTrackStateCore();

  // Get track operations with tracksRef for consistent state access
  const operations = useTrackOperations(
    tracks,
    setTracks,
    currentIndex,
    setCurrentIndex,
    setIsPlaying,
    tracksRef
  );

  // Get track management functions with consistent access to latest tracks
  const management = useTrackManagement(tracks, tracksRef);

  // Get debug functions
  const debug = useTrackDebug(
    tracks,
    currentIndex,
    isPlaying,
    isInitialized,
    needsSaving,
    stateVersion
  );

  // Return the public interface matching TrackStateResult interface exactly
  return {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    // Map operations to match interface
    addUrl: operations.addUrl,
    removeUrl: operations.removeUrl,
    toggleFavorite: operations.toggleFavorite,
    editTrack: operations.editTrack,
    updatePlayTime: operations.updatePlayTime,
    editStationByValue: operations.editStationByValue,
    removeStationByValue: operations.removeStationByValue,
    // Map management functions to match interface
    getUserStations: management.getMyStations,
    getTopStations: management.getPopularStations,
    checkIfStationExists: management.stationExists,
    // Map debug functions correctly
    debugState: debug.debugState,
    logCurrentState: debug.debugState, // Use debugState as logCurrentState
    getDebugInfo: () => ({
      tracksCount: tracks.length,
      currentTrack: currentIndex >= 0 && currentIndex < tracks.length ? tracks[currentIndex] : null,
      isPlaying,
      isInitialized,
      needsSaving: needsSaving.current,
      stateVersion: stateVersion.current
    })
  };
};
