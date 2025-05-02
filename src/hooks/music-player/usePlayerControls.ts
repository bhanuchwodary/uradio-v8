
import { useEffect } from "react";

interface UsePlayerControlsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
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
    setCurrentIndex(nextIndex);
  };

  // Handle previous track
  const handlePrevious = () => {
    if (urls.length === 0) return;
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
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
