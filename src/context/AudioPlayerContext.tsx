
import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Track } from "@/types/track";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { logger } from "@/utils/logger";

interface AudioPlayerContextType {
  // Current playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  loading: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  
  // Player controls - ONLY triggered by explicit user action
  playTrack: (track: Track) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  
  // Track management
  setCurrentTrack: (track: Track | null) => void;
  clearCurrentTrack: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: React.ReactNode;
  tracks: Track[];
  randomMode: boolean;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ 
  children, 
  tracks,
  randomMode 
}) => {
  // Core state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  // User interaction tracking to prevent auto-play
  const userInitiatedRef = useRef(false);
  
  // Enhanced next/previous handlers for random mode
  const handleNext = () => {
    if (!currentTrack || tracks.length <= 1) return;
    
    let nextIndex;
    if (randomMode) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex && tracks.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    
    const nextTrack = tracks[nextIndex];
    if (nextTrack) {
      setCurrentIndex(nextIndex);
      setCurrentTrack(nextTrack);
      logger.info("Next track selected", { name: nextTrack.name });
    }
  };

  const handlePrevious = () => {
    if (!currentTrack || tracks.length <= 1) return;
    
    let prevIndex;
    if (randomMode) {
      do {
        prevIndex = Math.floor(Math.random() * tracks.length);
      } while (prevIndex === currentIndex && tracks.length > 1);
    } else {
      prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    }
    
    const prevTrack = tracks[prevIndex];
    if (prevTrack) {
      setCurrentIndex(prevIndex);
      setCurrentTrack(prevTrack);
      logger.info("Previous track selected", { name: prevTrack.name });
    }
  };

  // Get URLs for player core
  const urls = currentTrack ? [currentTrack.url] : [];
  const playerCurrentIndex = currentTrack ? 0 : -1;

  // Use player core with enhanced handlers
  const {
    duration,
    currentTime,
    volume,
    setVolume: setCoreVolume,
    loading,
    handlePlayPause: coreHandlePlayPause,
    handleSeek
  } = usePlayerCore({
    urls,
    currentIndex: playerCurrentIndex,
    setCurrentIndex: () => {}, // Not used in single track mode
    isPlaying,
    setIsPlaying,
    tracks: currentTrack ? [currentTrack] : [],
    enhancedHandlers: {
      handleNext,
      handlePrevious,
      randomMode
    }
  });

  // Update current index when track changes
  useEffect(() => {
    if (currentTrack && tracks.length > 0) {
      const index = tracks.findIndex(t => t.url === currentTrack.url);
      setCurrentIndex(index);
    } else {
      setCurrentIndex(-1);
    }
  }, [currentTrack, tracks]);

  // CRITICAL: Only play track when explicitly requested by user
  const playTrack = (track: Track) => {
    logger.info("User explicitly requested to play track", { name: track.name });
    userInitiatedRef.current = true;
    
    // If same track is already selected, just toggle play/pause
    if (currentTrack?.url === track.url) {
      coreHandlePlayPause();
    } else {
      // Set new track and start playing
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    logger.info("User paused playback");
    userInitiatedRef.current = true;
    setIsPlaying(false);
  };

  const resumePlayback = () => {
    if (!currentTrack) return;
    logger.info("User resumed playback");
    userInitiatedRef.current = true;
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    logger.info("User toggled play/pause");
    userInitiatedRef.current = true;
    coreHandlePlayPause();
  };

  const nextTrack = () => {
    logger.info("User clicked next track");
    userInitiatedRef.current = true;
    handleNext();
  };

  const previousTrack = () => {
    logger.info("User clicked previous track");
    userInitiatedRef.current = true;
    handlePrevious();
  };

  const setVolumeWrapper = (vol: number) => {
    setCoreVolume(vol);
  };

  const seekTo = (time: number) => {
    handleSeek([time]);
  };

  const clearCurrentTrack = () => {
    logger.info("Clearing current track");
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentIndex(-1);
  };

  const contextValue: AudioPlayerContextType = {
    currentTrack,
    isPlaying,
    loading,
    volume,
    currentTime,
    duration,
    playTrack,
    pausePlayback,
    resumePlayback,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume: setVolumeWrapper,
    seekTo,
    setCurrentTrack,
    clearCurrentTrack
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};
