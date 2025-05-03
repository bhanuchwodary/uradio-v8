
import { useTrackStateCore } from "./track-state/useTrackStateCore";
import { useTrackOperations } from "./track-state/useTrackOperations";
import { useTrackManagement } from "./track-state/useTrackManagement";
import { useTrackDebug } from "./track-state/useTrackDebug";
import { TrackStateResult } from "./track-state/types";

export const useTrackState = (): TrackStateResult => {
  // Get core state management
  const {
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
  } = useTrackStateCore();

  // Get track operations
  const operations = useTrackOperations(
    tracks,
    setTracks,
    currentIndex,
    setCurrentIndex,
    setIsPlaying
  );

  // Get track management functions
  const management = useTrackManagement(tracks);

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
