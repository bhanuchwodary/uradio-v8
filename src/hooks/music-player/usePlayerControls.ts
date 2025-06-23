// src/hooks/music-player/usePlayerControls.ts
import { useEffect, useCallback } from "react";
import { globalAudioRef, updateGlobalPlaybackState, setNavigationState } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";

interface UsePlayerControlsProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

export const usePlayerControls = ({
  isPlaying,
  setIsPlaying,
  urls,
  currentIndex,
  setCurrentIndex,
}: UsePlayerControlsProps) => {
  const handleNext = useCallback(() => {
    if (urls.length === 0) return;
    const nextIndex = (currentIndex + 1) % urls.length;
    logger.info("Navigation: Next track selected, index:", nextIndex);
    setCurrentIndex(nextIndex);

    // If currently playing, explicitly set desired state to true.
    // useHlsHandler will then attempt to play the new track.
    if (isPlaying) {
      setIsPlaying(true);
      logger.debug("Continuing playback on next track (triggering setIsPlaying).");
    } else {
      // If paused, keep it paused, just change track
      setIsPlaying(false);
    }
    updateGlobalPlaybackState(false, false, false); // Clear interruption flags on user navigation
    setNavigationState(false); // This flag seems to be part of the old system, might need review.
  }, [currentIndex, isPlaying, setCurrentIndex, setIsPlaying, urls]);

  const handlePrevious = useCallback(() => {
    if (urls.length === 0) return;
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    logger.info("Navigation: Previous track selected, index:", prevIndex);
    setCurrentIndex(prevIndex);

    if (isPlaying) {
      setIsPlaying(true);
      logger.debug("Continuing playback on previous track (triggering setIsPlaying).");
    } else {
      setIsPlaying(false);
    }
    updateGlobalPlaybackState(false, false, false);
    setNavigationState(false);
  }, [currentIndex, isPlaying, setCurrentIndex, setIsPlaying, urls]);

  return { handleNext, handlePrevious };
};
