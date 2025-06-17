
import { useEffect } from "react";
import { updateGlobalPlaybackState, setNavigationState } from "@/components/music-player/audioInstance";

interface UsePlayerControlsProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  volume: number;
}

export const usePlayerControls = ({
  audioRef,
  isPlaying,
  setIsPlaying,
  urls,
  currentIndex,
  setCurrentIndex,
  volume
}: UsePlayerControlsProps) => {
  // Handle next track
  const handleNext = () => {
    if (urls.length === 0) return;
    const nextIndex = (currentIndex + 1) % urls.length;
    console.log("Navigation: Next track selected, index:", nextIndex);
    setCurrentIndex(nextIndex);
    
    // CRITICAL FIX: If currently playing, continue playback on new track
    if (isPlaying) {
      console.log("Continuing playback on next track");
      // Reset audio state to ensure new track can play immediately
      updateGlobalPlaybackState(false, false, false);
      setNavigationState(false);
      
      // Trigger playback after a short delay to ensure track loads
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }
  };

  // Handle previous track
  const handlePrevious = () => {
    if (urls.length === 0) return;
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    console.log("Navigation: Previous track selected, index:", prevIndex);
    setCurrentIndex(prevIndex);
    
    // CRITICAL FIX: If currently playing, continue playback on new track
    if (isPlaying) {
      console.log("Continuing playback on previous track");
      // Reset audio state to ensure new track can play immediately
      updateGlobalPlaybackState(false, false, false);
      setNavigationState(false);
      
      // Trigger playback after a short delay to ensure track loads
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        console.log("User pausing playback");
        audioRef.current.pause();
        // Mark as explicitly paused by user
        updateGlobalPlaybackState(false, true, true);
      } else {
        console.log("User starting playback");
        // Reset any previous pause states for user-initiated play
        updateGlobalPlaybackState(false, false, false);
        setNavigationState(false);
        
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current && !isNaN(value[0])) {
      audioRef.current.currentTime = value[0];
    }
  };

  // CRITICAL FIX: Auto-trigger playback when currentIndex changes and we're in playing state
  useEffect(() => {
    if (isPlaying && audioRef.current && urls[currentIndex]) {
      console.log("Current index changed while playing, ensuring playback continues");
      
      // Small delay to ensure new track is loaded
      const playbackTimer = setTimeout(() => {
        if (audioRef.current && isPlaying) {
          audioRef.current.play().catch(error => {
            console.error("Error continuing playback on track change:", error);
            setIsPlaying(false);
          });
        }
      }, 150);
      
      return () => clearTimeout(playbackTimer);
    }
  }, [currentIndex, isPlaying, urls, audioRef, setIsPlaying]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef, setIsPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioRef]);

  return {
    handleNext,
    handlePrevious,
    handlePlayPause,
    handleSeek
  };
};
