
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

  // Return the public interface
  return {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    ...operations,
    ...management,
    ...debug
  };
};
