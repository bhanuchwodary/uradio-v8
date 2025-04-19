
import { useTrackState } from "./useTrackState";
import { usePlaybackState } from "./usePlaybackState";
import { useMediaSession } from "./useMediaSession";

export const useMusicPlayer = () => {
  const {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
  } = useTrackState();

  const {
    trackDuration,
    trackPosition,
    updateTrackProgress,
    seekTo,
  } = usePlaybackState();

  const handleSkipNext = () => {
    if (tracks.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    }
  };

  const handleSkipPrevious = () => {
    if (tracks.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    }
  };

  // Set up media session integration
  useMediaSession({
    tracks,
    currentIndex,
    isPlaying,
    trackDuration,
    trackPosition,
    setIsPlaying,
    onSkipNext: handleSkipNext,
    onSkipPrevious: handleSkipPrevious,
    onSeek: seekTo,
  });

  // Get urls array for backward compatibility
  const urls = tracks.map(track => track.url);

  return {
    tracks,
    urls,
    currentIndex,
    isPlaying,
    trackPosition,
    trackDuration,
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
    setCurrentIndex,
    setIsPlaying,
    updateTrackProgress,
    seekTo,
  };
};
