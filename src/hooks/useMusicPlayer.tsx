
import { useState, useRef } from "react";
import { Track } from "@/types/track";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useHlsHandler } from "./music-player/useHlsHandler";
import { useAudioEvents } from "./music-player/useAudioEvents";
import { useAudioInitialization } from "./music-player/useAudioInitialization";
import { usePlayerControls } from "./music-player/usePlayerControls";

interface UseMusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  tracks?: Track[];
  initialVolume?: number;
}

export const useMusicPlayer = (props?: UseMusicPlayerProps) => {
  // If we don't have props, provide default values
  const {
    urls = [],
    currentIndex = 0,
    setCurrentIndex = () => {},
    isPlaying = false,
    setIsPlaying = () => {},
    tracks = [],
    initialVolume = 0.7,
  } = props || {};

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Updated to use MutableRefObject since we need to assign to audioRef.current
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Updated to use lowercase symbol primitive type instead of Symbol object
  const playerInstanceRef = useRef<symbol>(Symbol("playerInstance"));

  // Initialize audio
  useAudioInitialization({
    audioRef,
    playerInstanceRef,
    volume
  });

  // Set up player controls
  const {
    handleNext,
    handlePrevious,
    handlePlayPause,
    handleSeek
  } = usePlayerControls({
    audioRef,
    isPlaying,
    setIsPlaying,
    urls,
    currentIndex,
    setCurrentIndex,
    volume
  });

  // Handle HLS streaming
  useHlsHandler({
    audioRef,
    url: urls[currentIndex],
    isPlaying,
    setIsPlaying,
    setLoading
  });

  // Set up audio event listeners
  useAudioEvents({
    audioRef,
    setCurrentTime,
    setDuration,
    onEnded: handleNext,
    setLoading
  });

  // Set up media session API
  useMediaSession({
    tracks,
    currentIndex,
    isPlaying,
    trackDuration: duration,
    trackPosition: currentTime,
    setIsPlaying,
    onSkipNext: handleNext,
    onSkipPrevious: handlePrevious,
    onSeek: (position) => {
      handleSeek([position]);
    },
  });

  return {
    duration,
    currentTime,
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    // Include these properties for compatibility with existing code
    urls,
    tracks,
    removeUrl: (index: number) => console.warn("removeUrl not implemented"),
    editTrack: (index: number, data: { url: string; name: string }) => 
      console.warn("editTrack not implemented"),
  };
};
