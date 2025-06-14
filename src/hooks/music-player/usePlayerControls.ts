
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
  // Handle next track - STRICTLY within provided URLs array
  const handleNext = () => {
    console.log("usePlayerControls - handleNext called");
    console.log("- Current index:", currentIndex);
    console.log("- URLs array length:", urls.length);
    console.log("- URLs array:", urls);
    
    if (urls.length === 0) {
      console.log("- No URLs available - STOPPING");
      return;
    }
    
    // STRICT boundary check - only navigate within provided URLs
    if (currentIndex < 0 || currentIndex >= urls.length) {
      console.log("- Current index out of bounds, resetting to 0");
      setCurrentIndex(0);
      return;
    }
    
    // Calculate next index within the bounds of the provided URLs ONLY
    const nextIndex = (currentIndex + 1) % urls.length;
    console.log("- Next index:", nextIndex);
    console.log("- CONFIRMED: Navigation STRICTLY within provided URLs array");
    
    setCurrentIndex(nextIndex);
  };

  // Handle previous track - STRICTLY within provided URLs array  
  const handlePrevious = () => {
    console.log("usePlayerControls - handlePrevious called");
    console.log("- Current index:", currentIndex);
    console.log("- URLs array length:", urls.length);
    console.log("- URLs array:", urls);
    
    if (urls.length === 0) {
      console.log("- No URLs available - STOPPING");
      return;
    }
    
    // STRICT boundary check - only navigate within provided URLs
    if (currentIndex < 0 || currentIndex >= urls.length) {
      console.log("- Current index out of bounds, resetting to 0");
      setCurrentIndex(0);
      return;
    }
    
    // Calculate previous index within the bounds of the provided URLs ONLY
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    console.log("- Previous index:", prevIndex);
    console.log("- CONFIRMED: Navigation STRICTLY within provided URLs array");
    
    setCurrentIndex(prevIndex);
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (audioRef.current && urls.length > 0) {
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
    if (!audioRef.current || urls.length === 0) return;

    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, audioRef, setIsPlaying, urls.length]);

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
