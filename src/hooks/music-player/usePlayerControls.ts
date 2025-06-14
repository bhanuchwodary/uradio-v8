
import { useEffect } from "react";

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
  // Handle next track - ONLY within provided URLs array
  const handleNext = () => {
    console.log("usePlayerControls - handleNext called");
    console.log("- Current index:", currentIndex);
    console.log("- URLs array length:", urls.length);
    
    if (urls.length === 0) {
      console.log("- No URLs available");
      return;
    }
    
    // Calculate next index within the bounds of the provided URLs
    const nextIndex = (currentIndex + 1) % urls.length;
    console.log("- Next index:", nextIndex);
    console.log("- CONFIRMED: Navigation within provided URLs array only");
    
    setCurrentIndex(nextIndex);
  };

  // Handle previous track - ONLY within provided URLs array
  const handlePrevious = () => {
    console.log("usePlayerControls - handlePrevious called");
    console.log("- Current index:", currentIndex);
    console.log("- URLs array length:", urls.length);
    
    if (urls.length === 0) {
      console.log("- No URLs available");
      return;
    }
    
    // Calculate previous index within the bounds of the provided URLs
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    console.log("- Previous index:", prevIndex);
    console.log("- CONFIRMED: Navigation within provided URLs array only");
    
    setCurrentIndex(prevIndex);
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
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
