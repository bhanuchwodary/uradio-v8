
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
  setRandomMode: (randomMode: boolean) => void;
  clearCurrentTrack: () => void;
  setPlaylistTracks: (tracks: Track[]) => void;
  playlistTracks: Track[];
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
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);

  // Use the HLS handler for audio management
  useHlsHandler({
    url: currentTrack?.url,
    isPlaying,
    setIsPlaying,
    setLoading,
  });

  // Update volume on the global audio element
  useEffect(() => {
    if (globalAudioRef.element) {
      globalAudioRef.element.volume = volume;
    }
  }, [volume]);

  const playTrack = useCallback((track: Track) => {
    console.log("AudioPlayerContext: playTrack called with:", track.name, track.url);
    setCurrentTrack(track);
    setIsPlaying(true);
    logger.debug("playTrack called. Setting isPlaying to true.", { trackName: track.name });
  }, []);

  const pausePlayback = useCallback(() => {
    console.log("AudioPlayerContext: pausePlayback called");
    setIsPlaying(false);
    logger.debug("pausePlayback called. Setting isPlaying to false.");
  }, []);

  const resumePlayback = useCallback(() => {
    console.log("AudioPlayerContext: resumePlayback called");
    setIsPlaying(true);
    logger.debug("resumePlayback called. Setting isPlaying to true.");
  }, []);

  const togglePlayPause = useCallback(() => {
    console.log("AudioPlayerContext: togglePlayPause called, current isPlaying:", isPlaying);
    if (currentTrack) {
      setIsPlaying(prev => !prev);
      logger.debug("togglePlayPause called.");
    } else {
      console.log("AudioPlayerContext: No current track to play/pause");
    }
  }, [isPlaying, currentTrack]);

  const clearCurrentTrack = useCallback(() => {
    console.log("AudioPlayerContext: clearCurrentTrack called");
    setCurrentTrack(null);
    setIsPlaying(false);
    logger.debug("clearCurrentTrack called.");
  }, []);

  const nextTrack = useCallback(() => {
    console.log("AudioPlayerContext: nextTrack called");
    const activeTrackList = playlistTracks.length > 0 ? playlistTracks : tracks;
    
    if (activeTrackList.length === 0 || !currentTrack) {
      console.log("AudioPlayerContext: No tracks available or no current track");
      return;
    }
    
    const currentIndex = activeTrackList.findIndex(track => track.url === currentTrack.url);
    let nextIndex;
    
    if (randomMode) {
      nextIndex = Math.floor(Math.random() * activeTrackList.length);
      console.log("AudioPlayerContext: Random mode - selected index:", nextIndex);
    } else {
      nextIndex = (currentIndex + 1) % activeTrackList.length;
      console.log("AudioPlayerContext: Sequential mode - next index:", nextIndex);
    }
    
    const nextTrackToPlay = activeTrackList[nextIndex];
    console.log("AudioPlayerContext: Playing next track:", nextTrackToPlay.name);
    playTrack(nextTrackToPlay);
  }, [playlistTracks, tracks, currentTrack, randomMode, playTrack]);

  const previousTrack = useCallback(() => {
    console.log("AudioPlayerContext: previousTrack called");
    const activeTrackList = playlistTracks.length > 0 ? playlistTracks : tracks;
    
    if (activeTrackList.length === 0 || !currentTrack) {
      console.log("AudioPlayerContext: No tracks available or no current track");
      return;
    }
    
    const currentIndex = activeTrackList.findIndex(track => track.url === currentTrack.url);
    let prevIndex;
    
    if (randomMode) {
      prevIndex = Math.floor(Math.random() * activeTrackList.length);
      console.log("AudioPlayerContext: Random mode - selected index:", prevIndex);
    } else {
      prevIndex = (currentIndex - 1 + activeTrackList.length) % activeTrackList.length;
      console.log("AudioPlayerContext: Sequential mode - previous index:", prevIndex);
    }
    
    const prevTrackToPlay = activeTrackList[prevIndex];
    console.log("AudioPlayerContext: Playing previous track:", prevTrackToPlay.name);
    playTrack(prevTrackToPlay);
  }, [playlistTracks, tracks, currentTrack, randomMode, playTrack]);

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
    setRandomMode,
    clearCurrentTrack,
    setPlaylistTracks,
    playlistTracks,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
