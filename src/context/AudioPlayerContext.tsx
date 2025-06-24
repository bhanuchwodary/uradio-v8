
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '@/types/track';
import { useHlsHandler } from '@/hooks/music-player/useHlsHandler';
import { globalAudioRef } from '@/components/music-player/audioInstance';
import { useEnhancedMediaSession } from '@/hooks/useEnhancedMediaSession';
import { useNativeMediaControls } from '@/hooks/useNativeMediaControls';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize global audio element if not already done
  useEffect(() => {
    if (!globalAudioRef.element) {
      const audio = new Audio();
      audio.preload = 'auto';
      globalAudioRef.element = audio;
      logger.debug("Global audio element initialized");
    }
    audioRef.current = globalAudioRef.element;
  }, []);

  // Define callback functions FIRST, before using them in hooks
  const playTrack = useCallback((track: Track) => {
    console.log("AudioPlayerContext: playTrack called with:", track.name);
    logger.debug("Playing track", { trackName: track.name, url: track.url });
    
    // Set the track and playing state immediately without setTimeout
    setCurrentTrack(track);
    setIsPlaying(true);
    
    console.log("AudioPlayerContext: Immediately set track and playing state");
  }, []);

  const pausePlayback = useCallback(() => {
    console.log("AudioPlayerContext: pausePlayback called");
    setIsPlaying(false);
    logger.debug("Pausing playback");
  }, []);

  const resumePlayback = useCallback(() => {
    console.log("AudioPlayerContext: resumePlayback called");
    if (currentTrack) {
      setIsPlaying(true);
      logger.debug("Resuming playback");
    }
  }, [currentTrack]);

  const togglePlayPause = useCallback(() => {
    console.log("AudioPlayerContext: togglePlayPause called, current isPlaying:", isPlaying);
    if (currentTrack) {
      if (isPlaying) {
        pausePlayback();
      } else {
        resumePlayback();
      }
      logger.debug("Toggling play/pause");
    }
  }, [isPlaying, currentTrack, pausePlayback, resumePlayback]);

  const nextTrack = useCallback(() => {
    console.log("AudioPlayerContext: nextTrack called");
    
    // Use playlist tracks if available, otherwise fall back to main tracks
    const activeTrackList = playlistTracks.length > 0 ? playlistTracks : tracks;
    
    if (activeTrackList.length === 0) {
      console.log("AudioPlayerContext: No tracks available for next");
      return;
    }

    if (!currentTrack) {
      // If no current track, play first track
      const firstTrack = activeTrackList[0];
      console.log("AudioPlayerContext: No current track, playing first:", firstTrack.name);
      playTrack(firstTrack);
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
    
    // Use playlist tracks if available, otherwise fall back to main tracks
    const activeTrackList = playlistTracks.length > 0 ? playlistTracks : tracks;
    
    if (activeTrackList.length === 0) {
      console.log("AudioPlayerContext: No tracks available for previous");
      return;
    }

    if (!currentTrack) {
      // If no current track, play last track
      const lastTrack = activeTrackList[activeTrackList.length - 1];
      console.log("AudioPlayerContext: No current track, playing last:", lastTrack.name);
      playTrack(lastTrack);
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

  const clearCurrentTrack = useCallback(() => {
    console.log("AudioPlayerContext: clearCurrentTrack called");
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    logger.debug("Cleared current track");
  }, []);

  // Use the HLS handler for stream management
  useHlsHandler({
    url: currentTrack?.url,
    isPlaying,
    setIsPlaying,
    setLoading,
  });

  // Enhanced media session integration - NOW called AFTER callbacks are defined
  useEnhancedMediaSession({
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    onPlay: resumePlayback,
    onPause: pausePlayback,
    onNext: nextTrack,
    onPrevious: previousTrack,
    onSeek: (time: number) => {
      const audio = globalAudioRef.element;
      if (audio) {
        audio.currentTime = time;
        logger.debug("Seeked via media session to:", time);
      }
    },
    onVolumeChange: setVolume,
  });

  // Native media controls for mobile platforms - NOW called AFTER callbacks are defined
  useNativeMediaControls({
    isPlaying,
    currentTrackName: currentTrack?.name,
    onPlay: resumePlayback,
    onPause: pausePlayback,
    onNext: nextTrack,
    onPrevious: previousTrack,
  });

  // Audio event listeners for time updates
  useEffect(() => {
    const audio = globalAudioRef.element;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      logger.debug("Track ended, moving to next track");
      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextTrack]);

  // Volume control
  useEffect(() => {
    const audio = globalAudioRef.element;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

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
