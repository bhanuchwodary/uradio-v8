
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '@/types/track';
import { useHlsHandler } from '@/hooks/music-player/useHlsHandler';
import { globalAudioRef } from '@/components/music-player/audioInstance';
import { logger } from '@/utils/logger';

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  randomMode: boolean;
  loading: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playTrack: (track: Track) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
}

interface AudioPlayerProviderProps {
  children: React.ReactNode;
  tracks: Track[];
  randomMode: boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ 
  children, 
  tracks,
  randomMode: initialRandomMode 
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [randomMode, setRandomMode] = useState(initialRandomMode);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use the global audio ref directly from the instance
  useEffect(() => {
    audioRef.current = globalAudioRef.element;
  }, []);

  // Use the HLS handler, passing the currentTrack's URL and isPlaying state
  useHlsHandler({
    url: currentTrack?.url,
    isPlaying,
    setIsPlaying,
    setLoading,
  });

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    logger.debug("playTrack called. Setting isPlaying to true.");
  }, []);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    logger.debug("pausePlayback called. Setting isPlaying to false.");
  }, []);

  const resumePlayback = useCallback(() => {
    setIsPlaying(true);
    logger.debug("resumePlayback called. Setting isPlaying to true.");
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
    logger.debug("togglePlayPause called.");
  }, []);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0 || !currentTrack) return;
    
    const currentIndex = tracks.findIndex(track => track.url === currentTrack.url);
    let nextIndex;
    
    if (randomMode) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    
    setCurrentTrack(tracks[nextIndex]);
    if (isPlaying) {
      setIsPlaying(true);
    }
  }, [tracks, currentTrack, randomMode, isPlaying]);

  const previousTrack = useCallback(() => {
    if (tracks.length === 0 || !currentTrack) return;
    
    const currentIndex = tracks.findIndex(track => track.url === currentTrack.url);
    let prevIndex;
    
    if (randomMode) {
      prevIndex = Math.floor(Math.random() * tracks.length);
    } else {
      prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    }
    
    setCurrentTrack(tracks[prevIndex]);
    if (isPlaying) {
      setIsPlaying(true);
    }
  }, [tracks, currentTrack, randomMode, isPlaying]);

  const contextValue: AudioPlayerContextType = {
    currentTrack,
    isPlaying,
    randomMode,
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
    setVolume,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
