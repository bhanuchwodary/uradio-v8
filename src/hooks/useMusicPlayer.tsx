
import { useState, useEffect } from "react";
import androidAutoService from "../services/androidAutoService";

export const useMusicPlayer = () => {
  const [urls, setUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackDuration, setTrackDuration] = useState(0);
  const [trackPosition, setTrackPosition] = useState(0);

  // Initialize Android Auto service
  useEffect(() => {
    androidAutoService.initialize();

    // Register callbacks for Android Auto controls
    androidAutoService.registerCallbacks({
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
      onSkipNext: () => handleSkipNext(),
      onSkipPrevious: () => handleSkipPrevious(),
    });

    return () => {
      androidAutoService.cleanup();
    };
  }, []);

  // Update Android Auto with current track info
  useEffect(() => {
    if (urls.length > 0) {
      const currentUrl = urls[currentIndex];
      let title;
      
      try {
        // Try to extract a filename from the URL
        title = new URL(currentUrl).pathname.split('/').pop() || `Track ${currentIndex + 1}`;
      } catch {
        title = `Track ${currentIndex + 1}`;
      }

      androidAutoService.updateTrackInfo({
        title,
        artist: "Music Streaming App",
        duration: trackDuration,
        position: trackPosition,
      });
    }
  }, [urls, currentIndex, trackDuration, trackPosition]);

  // Update Android Auto with playback state
  useEffect(() => {
    androidAutoService.updatePlaybackState(isPlaying);
  }, [isPlaying]);

  // Add a new URL to the playlist
  const addUrl = (url: string) => {
    setUrls((prevUrls) => [...prevUrls, url]);
  };

  // Remove a URL from the playlist
  const removeUrl = (index: number) => {
    setUrls((prevUrls) => {
      const newUrls = [...prevUrls];
      newUrls.splice(index, 1);
      
      // If we removed the current track
      if (index === currentIndex) {
        if (newUrls.length > 0) {
          // If we have tracks left, either stay at same index (if in bounds) or go to last track
          setCurrentIndex(Math.min(currentIndex, newUrls.length - 1));
        } else {
          // If no tracks left, reset to 0 and stop playback
          setCurrentIndex(0);
          setIsPlaying(false);
        }
      } else if (index < currentIndex) {
        // If we removed a track before the current one, adjust index
        setCurrentIndex(currentIndex - 1);
      }
      
      return newUrls;
    });
  };

  // Skip to next track
  const handleSkipNext = () => {
    if (urls.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % urls.length);
    }
  };

  // Skip to previous track
  const handleSkipPrevious = () => {
    if (urls.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + urls.length) % urls.length);
    }
  };

  // Update track progress
  const updateTrackProgress = (duration: number, position: number) => {
    setTrackDuration(duration);
    setTrackPosition(position);
  };

  return {
    urls,
    currentIndex,
    isPlaying,
    addUrl,
    removeUrl,
    setCurrentIndex,
    setIsPlaying,
    updateTrackProgress,
  };
};
