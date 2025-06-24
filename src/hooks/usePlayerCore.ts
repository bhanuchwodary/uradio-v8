
import { useMusicPlayer } from "./useMusicPlayer";
import { Track } from "@/types/track";
import { getVolumePreference } from "@/utils/volumeStorage";

interface UsePlayerCoreProps {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  tracks: Track[];
  randomMode: boolean;
  setRandomMode: (randomMode: boolean) => void;
}

export const usePlayerCore = ({
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  loading,
  setLoading,
  audioRef,
  tracks,
  randomMode,
  setRandomMode
}: UsePlayerCoreProps) => {
  const initialVolume = getVolumePreference();
  
  // Create URLs array from tracks
  const urls = tracks.map(track => track.url);
  const currentIndex = currentTrack ? tracks.findIndex(track => track.url === currentTrack.url) : 0;
  
  const setCurrentIndex = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrack(tracks[index]);
    }
  };

  // Enhanced handlers for random mode
  const enhancedHandlers = {
    handleNext: () => {
      if (tracks.length === 0) return;
      let nextIndex;
      if (randomMode) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } else {
        const current = currentTrack ? tracks.findIndex(track => track.url === currentTrack.url) : 0;
        nextIndex = (current + 1) % tracks.length;
      }
      setCurrentTrack(tracks[nextIndex]);
    },
    handlePrevious: () => {
      if (tracks.length === 0) return;
      let prevIndex;
      if (randomMode) {
        prevIndex = Math.floor(Math.random() * tracks.length);
      } else {
        const current = currentTrack ? tracks.findIndex(track => track.url === currentTrack.url) : 0;
        prevIndex = (current - 1 + tracks.length) % tracks.length;
      }
      setCurrentTrack(tracks[prevIndex]);
    },
    randomMode
  };

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

  return {
    ...playerProps,
    playTrack: (track: Track) => {
      setCurrentTrack(track);
      setIsPlaying(true);
    },
    pausePlayback: () => setIsPlaying(false),
    resumePlayback: () => setIsPlaying(true),
    togglePlayPause: () => setIsPlaying(!isPlaying),
    nextTrack: enhancedHandlers.handleNext,
    previousTrack: enhancedHandlers.handlePrevious
  };
};
