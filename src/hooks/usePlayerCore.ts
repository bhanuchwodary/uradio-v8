
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
  // Pass all props to useMusicPlayer
  const playerProps = useMusicPlayer({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });

  // Return all properties from useMusicPlayer for use in components
  return playerProps;
};
