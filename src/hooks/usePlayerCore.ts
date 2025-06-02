
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
  // Use the music player hook directly without passing initial volume
  const playerProps = useMusicPlayer();

  // Return all properties from useMusicPlayer for use in components
  return playerProps;
};
