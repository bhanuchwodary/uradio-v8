
// Streamlined MusicPlayer component that uses usePlayerCore for logic.
import React from "react";
import PlayerLayout from "@/components/music-player/PlayerLayout";
import PlayerTrackInfo from "@/components/music-player/PlayerTrackInfo";
import PlayerSlider from "@/components/music-player/PlayerSlider";
import PlayerControlsRow from "@/components/music-player/PlayerControlsRow";
import PlayerVolume from "@/components/music-player/PlayerVolume";
import { usePlayerCore } from "@/hooks/usePlayerCore";

interface MusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  tracks?: { name: string; url: string }[];
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
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
  } = usePlayerCore({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
  });

  return (
    <PlayerLayout>
      <PlayerTrackInfo
        title={tracks[currentIndex]?.name || `Track ${currentIndex + 1}`}
        url={urls[currentIndex]}
        loading={loading}
      />
      <PlayerSlider
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        disabled={!duration || duration === Infinity}
      />
      <PlayerControlsRow
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrevious}
        disabled={urls.length === 0}
      />
      <PlayerVolume
        volume={volume}
        setVolume={setVolume}
      />
    </PlayerLayout>
  );
};

export default MusicPlayer;
