
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
  // FIXED: Handle next track - ensure we stay within the provided urls array
  const handleNext = () => {
    console.log("usePlayerControls - handleNext called");
    console.log("- Current index:", currentIndex);
    console.log("- URLs length:", urls.length);
    console.log("- URLs:", urls);
    
    if (urls.length === 0) {
      console.log("- No URLs available, stopping");
      return;
    }
    
    // Ensure currentIndex is valid before calculating next
    const validCurrentIndex = Math.max(0, Math.min(currentIndex, urls.length - 1));
    const nextIndex = (validCurrentIndex + 1) % urls.length;
    
    console.log("- Valid current index:", validCurrentIndex);
    console.log("- Next index:", nextIndex);
    console.log("- Next URL:", urls[nextIndex]);
    
    setCurrentIndex(nextIndex);
  };

  // FIXED: Handle previous track - ensure we stay within the provided urls array
  const handlePrevious = () => {
    console.log("usePlayerControls - handlePrevious called");
    console.log("- Current index:", currentIndex);
    console.log("- URLs length:", urls.length);
    console.log("- URLs:", urls);
    
    if (urls.length === 0) {
      console.log("- No URLs available, stopping");
      return;
    }
    
    // Ensure currentIndex is valid before calculating previous
    const validCurrentIndex = Math.max(0, Math.min(currentIndex, urls.length - 1));
    const prevIndex = (validCurrentIndex - 1 + urls.length) % urls.length;
    
    console.log("- Valid current index:", validCurrentIndex);
    console.log("- Previous index:", prevIndex);
    console.log("- Previous URL:", urls[prevIndex]);
    
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
