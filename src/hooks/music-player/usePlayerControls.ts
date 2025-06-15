
import { useEffect } from "react";
import { Track } from "@/types/track";

interface UsePlayerControlsProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  volume: number;
  tracks?: Track[];
}

export const usePlayerControls = ({
  audioRef,
  isPlaying,
  setIsPlaying,
  urls,
  currentIndex,
  setCurrentIndex,
  volume,
  tracks = [],
}: UsePlayerControlsProps) => {
  const findPlayableIndex = (start: number, direction: 1 | -1): number => {
    if (tracks.length < 1) return start;
    
    let nextIndex = start;
    for (let i = 0; i < tracks.length; i++) {
      nextIndex = (nextIndex + direction + tracks.length) % tracks.length;
      const track = tracks[nextIndex];
      if (track && (track.isFavorite || (track.playTime && track.playTime > 0))) {
        return nextIndex;
      }
    }
    
    // If no other playable track is found, check if current one is playable
    const currentTrack = tracks[start];
    if (currentTrack && (currentTrack.isFavorite || (currentTrack.playTime && currentTrack.playTime > 0))) {
        return start;
    }

    // if current is also not playable, find the first playable and return it
    const firstPlayable = tracks.findIndex(t => t.isFavorite || (t.playTime && t.playTime > 0));
    return firstPlayable !== -1 ? firstPlayable : start;
  };

  // Handle next track
  const handleNext = () => {
    if (urls.length === 0) return;
    const nextIndex = findPlayableIndex(currentIndex, 1);
    setCurrentIndex(nextIndex);
  };

  // Handle previous track
  const handlePrevious = () => {
    if (urls.length === 0) return;
    const prevIndex = findPlayableIndex(currentIndex, -1);
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
