
import { useMusicPlayer } from "./useMusicPlayer";
import { Track } from "@/types/track";

interface UsePlayerCoreProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  tracks?: Track[];
}

export const usePlayerCore = ({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  tracks = []
}: UsePlayerCoreProps) => {
  return useMusicPlayer({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });
};
