
// Refactored: Container + hooks + layout presentation only
import React from "react";
import MusicPlayerLayout from "@/components/music-player/MusicPlayerLayout";
import { useMusicPlayerCore } from "@/components/music-player/useMusicPlayerCore";
import { Track } from "@/types/track";

interface MusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  tracks?: Track[];
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  urls,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  tracks = [],
}) => {
  const {
    duration,
    currentTime,
    volume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    setVolume,
  } = useMusicPlayerCore({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
  });

  const currentTrack = tracks[currentIndex];

  return (
    <MusicPlayerLayout
      trackTitle={currentTrack?.name || `Track ${currentIndex + 1}`}
      trackUrl={urls[currentIndex]}
      loading={loading}
      currentTime={currentTime}
      duration={duration}
      onSeek={handleSeek}
      isPlaying={isPlaying}
      onPlayPause={handlePlayPause}
      onNext={handleNext}
      onPrev={handlePrevious}
      volume={volume}
      setVolume={setVolume}
      className="h-full flex-1"
    />
  );
};

export default MusicPlayer;
