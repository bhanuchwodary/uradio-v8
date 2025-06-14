
import { useState } from "react";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { useLocation } from "react-router-dom";

export function useAppPlayer() {
  const [randomMode, setRandomMode] = useState(false);

  // Get track state for integrated player
  const { 
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying
  } = useTrackStateContext();
  
  // Use player core for player functionality
  const {
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext: originalHandleNext,
    handlePrevious: originalHandlePrevious,
  } = usePlayerCore({
    urls: tracks.map(track => track.url),
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });

  // Enhanced next/previous handlers for random mode
  const handleNext = () => {
    if (randomMode && tracks.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (randomIndex === currentIndex && tracks.length > 1);
      setCurrentIndex(randomIndex);
    } else {
      originalHandleNext();
    }
  };

  const handlePrevious = () => {
    if (randomMode && tracks.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (randomIndex === currentIndex && tracks.length > 1);
      setCurrentIndex(randomIndex);
    } else {
      originalHandlePrevious();
    }
  };

  const currentTrack = tracks[currentIndex] || null;

  return {
    currentTrack,
    isPlaying,
    loading,
    volume,
    setVolume,
    handlePlayPause,
    handleNext,
    handlePrevious,
    randomMode,
    setRandomMode,
    tracks
  };
}
