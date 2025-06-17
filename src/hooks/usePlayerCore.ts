
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
  enhancedHandlers?: {
    handleNext: () => void;
    handlePrevious: () => void;
    randomMode: boolean;
  };
}

export const usePlayerCore = ({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  tracks = [],
  enhancedHandlers
}: UsePlayerCoreProps) => {
  // Get initial volume from stored preference
  const initialVolume = getVolumePreference();
  
  // Pass all props to useMusicPlayer with the initial volume and enhanced handlers
  const playerProps = useMusicPlayer({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks,
    initialVolume,
    enhancedHandlers
  });

  // Return all properties from useMusicPlayer for use in components
  return playerProps;
};
