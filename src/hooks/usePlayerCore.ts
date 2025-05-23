
import { useMusicPlayer } from "./useMusicPlayer";
import { Track } from "@/types/track";
import { getVolumePreference } from "@/utils/volumeStorage";

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
  // Get initial volume from stored preference
  const initialVolume = getVolumePreference();
  
  // Pass all props to useMusicPlayer with the initial volume
  const playerProps = useMusicPlayer({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks,
    initialVolume
  });

  // Return all properties from useMusicPlayer for use in components
  return playerProps;
};
