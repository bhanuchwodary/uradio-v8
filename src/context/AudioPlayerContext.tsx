import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Track } from "@/types/track";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { usePlaylistNavigation } from "@/hooks/usePlaylistNavigation";
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
  
  // Get playlist navigation functions
  const { getNextTrack, getPreviousTrack } = usePlaylistNavigation();
  
  console.log("RANDOM MODE DEBUG: AudioPlayerProvider initialized with randomMode:", randomMode);
  
  // Enhanced next/previous handlers for random mode and playlist navigation
  const handleNext = () => {
    logger.info("AudioPlayerContext: Next track requested", { randomMode, currentTrack: currentTrack?.name });
    console.log("RANDOM MODE DEBUG: handleNext called with randomMode:", randomMode);
    
    const nextTrack = getNextTrack(currentTrack, randomMode);
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      logger.info("Next track selected from playlist", { name: nextTrack.name, randomMode });
      console.log("RANDOM MODE DEBUG: Selected next track:", nextTrack.name, "Random mode:", randomMode);
      
      // Update media session metadata for external controls
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: nextTrack.name,
          artist: nextTrack.language || 'Radio Station',
          album: 'uRadio'
        });
        
        // Set action handlers for external controls
        navigator.mediaSession.setActionHandler('nexttrack', handleNext);
        navigator.mediaSession.setActionHandler('previoustrack', handlePrevious);
      }
    } else {
      console.log("RANDOM MODE DEBUG: No next track found");
    }
  };

  const handlePrevious = () => {
    logger.info("AudioPlayerContext: Previous track requested", { randomMode, currentTrack: currentTrack?.name });
    console.log("RANDOM MODE DEBUG: handlePrevious called with randomMode:", randomMode);
    
    const prevTrack = getPreviousTrack(currentTrack, randomMode);
    if (prevTrack) {
      setCurrentTrack(prevTrack);
      logger.info("Previous track selected from playlist", { name: prevTrack.name, randomMode });
      console.log("RANDOM MODE DEBUG: Selected previous track:", prevTrack.name, "Random mode:", randomMode);
      
      // Update media session metadata for external controls
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: prevTrack.name,
          artist: prevTrack.language || 'Radio Station',
          album: 'uRadio'
        });
        
        // Set action handlers for external controls
        navigator.mediaSession.setActionHandler('nexttrack', handleNext);
        navigator.mediaSession.setActionHandler('previoustrack', handlePrevious);
      }
    } else {
      console.log("RANDOM MODE DEBUG: No previous track found");
    }
  };

  // Get URLs for player core
  const urls = currentTrack ? [currentTrack.url] : [];
  const playerCurrentIndex = currentTrack ? 0 : -1;

  // Use player core with enhanced handlers that include current randomMode
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
      randomMode // Pass current randomMode to player core
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

  // Setup media session when track changes or random mode changes
  useEffect(() => {
    console.log("RANDOM MODE DEBUG: Media session setup effect triggered", { 
      currentTrack: currentTrack?.name, 
      randomMode 
    });
    
    if (currentTrack && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.language || 'Radio Station',
        album: 'uRadio'
      });
      
      // Set action handlers for external controls with random mode support
      navigator.mediaSession.setActionHandler('play', () => {
        logger.info("External control: play");
        resumePlayback();
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        logger.info("External control: pause");
        pausePlayback();
      });
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        logger.info("External control: next track", { randomMode });
        console.log("RANDOM MODE DEBUG: External control next track with randomMode:", randomMode);
        handleNext();
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        logger.info("External control: previous track", { randomMode });
        console.log("RANDOM MODE DEBUG: External control previous track with randomMode:", randomMode);
        handlePrevious();
      });
    }
  }, [currentTrack, randomMode]);

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
    logger.info("User clicked next track", { randomMode });
    console.log("RANDOM MODE DEBUG: User clicked next track, randomMode:", randomMode);
    userInitiatedRef.current = true;
    handleNext();
  };

  const previousTrack = () => {
    logger.info("User clicked previous track", { randomMode });
    console.log("RANDOM MODE DEBUG: User clicked previous track, randomMode:", randomMode);
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
