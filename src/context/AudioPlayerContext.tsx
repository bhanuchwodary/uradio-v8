
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
  randomMode: boolean;
  
  // Player controls - ONLY triggered by explicit user action
  playTrack: (track: Track) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  setRandomMode: (randomMode: boolean) => void;
  
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
  randomMode: initialRandomMode 
}) => {
  // Core state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [randomMode, setRandomMode] = useState(initialRandomMode);
  
  // User interaction tracking to prevent auto-play
  const userInitiatedRef = useRef(false);
  
  console.log("RANDOM MODE DEBUG: AudioPlayerProvider initialized with randomMode:", randomMode);
  
  // Sync random mode with prop changes
  useEffect(() => {
    console.log("RANDOM MODE DEBUG: Syncing randomMode from prop:", initialRandomMode);
    setRandomMode(initialRandomMode);
  }, [initialRandomMode]);
  
  // Get playlist tracks - use tracks directly from context
  const getPlaylistTracks = (): Track[] => {
    return tracks || [];
  };

  // Enhanced random track selection
  const getNextTrack = (currentTrack: Track | null): Track | null => {
    const playlistTracks = getPlaylistTracks();
    console.log("RANDOM MODE DEBUG: getNextTrack called", { 
      currentTrack: currentTrack?.name, 
      randomMode, 
      totalTracks: playlistTracks.length 
    });
    
    if (!currentTrack || playlistTracks.length <= 1) {
      console.log("RANDOM MODE DEBUG: No next track - insufficient tracks");
      return null;
    }
    
    const currentIndex = playlistTracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) {
      console.log("RANDOM MODE DEBUG: Current track not found in playlist");
      return null;
    }
    
    let nextIndex;
    if (randomMode) {
      console.log("RANDOM MODE DEBUG: Using random selection for next track");
      // Generate random index different from current
      const availableIndices = playlistTracks.map((_, i) => i).filter(i => i !== currentIndex);
      if (availableIndices.length === 0) {
        console.log("RANDOM MODE DEBUG: No other tracks available for random selection");
        return null;
      }
      const randomChoice = Math.floor(Math.random() * availableIndices.length);
      nextIndex = availableIndices[randomChoice];
      console.log("RANDOM MODE DEBUG: Random selection - available indices:", availableIndices, "chosen:", nextIndex);
    } else {
      console.log("RANDOM MODE DEBUG: Using sequential selection");
      nextIndex = (currentIndex + 1) % playlistTracks.length;
    }
    
    const nextTrack = playlistTracks[nextIndex] || null;
    console.log("RANDOM MODE DEBUG: Selected next track:", {
      nextIndex,
      trackName: nextTrack?.name,
      randomMode,
      fromIndex: currentIndex
    });
    
    return nextTrack;
  };

  const getPreviousTrack = (currentTrack: Track | null): Track | null => {
    const playlistTracks = getPlaylistTracks();
    console.log("RANDOM MODE DEBUG: getPreviousTrack called", { 
      currentTrack: currentTrack?.name, 
      randomMode, 
      totalTracks: playlistTracks.length 
    });
    
    if (!currentTrack || playlistTracks.length <= 1) {
      console.log("RANDOM MODE DEBUG: No previous track - insufficient tracks");
      return null;
    }
    
    const currentIndex = playlistTracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) {
      console.log("RANDOM MODE DEBUG: Current track not found in playlist");
      return null;
    }
    
    let prevIndex;
    if (randomMode) {
      console.log("RANDOM MODE DEBUG: Using random selection for previous track");
      // Generate random index different from current
      const availableIndices = playlistTracks.map((_, i) => i).filter(i => i !== currentIndex);
      if (availableIndices.length === 0) {
        console.log("RANDOM MODE DEBUG: No other tracks available for random selection");
        return null;
      }
      const randomChoice = Math.floor(Math.random() * availableIndices.length);
      prevIndex = availableIndices[randomChoice];
      console.log("RANDOM MODE DEBUG: Random selection for previous - available indices:", availableIndices, "chosen:", prevIndex);
    } else {
      console.log("RANDOM MODE DEBUG: Using sequential selection for previous");
      prevIndex = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
    }
    
    const prevTrack = playlistTracks[prevIndex] || null;
    console.log("RANDOM MODE DEBUG: Selected previous track:", {
      prevIndex,
      trackName: prevTrack?.name,
      randomMode,
      fromIndex: currentIndex
    });
    
    return prevTrack;
  };

  // Enhanced next/previous handlers for random mode and playlist navigation
  const handleNext = () => {
    logger.info("AudioPlayerContext: Next track requested", { randomMode, currentTrack: currentTrack?.name });
    console.log("RANDOM MODE DEBUG: handleNext called with randomMode:", randomMode);
    
    const nextTrack = getNextTrack(currentTrack);
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
      }
    } else {
      console.log("RANDOM MODE DEBUG: No next track found");
    }
  };

  const handlePrevious = () => {
    logger.info("AudioPlayerContext: Previous track requested", { randomMode, currentTrack: currentTrack?.name });
    console.log("RANDOM MODE DEBUG: handlePrevious called with randomMode:", randomMode);
    
    const prevTrack = getPreviousTrack(currentTrack);
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
    randomMode,
    playTrack,
    pausePlayback,
    resumePlayback,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume: setVolumeWrapper,
    seekTo,
    setCurrentTrack,
    clearCurrentTrack,
    setRandomMode
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
