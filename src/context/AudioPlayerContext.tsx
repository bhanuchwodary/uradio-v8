import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Track } from "@/types/track";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { logger } from "@/utils/logger";
import { usePlaylist } from "@/context/PlaylistContext";
import { getVolumePreference } from "@/utils/volumeStorage";

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
  // Core state - initialize volume from stored preference
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [randomMode, setRandomMode] = useState(initialRandomMode);
  
  // Get playlist context for navigation
  const { sortedPlaylistTracks } = usePlaylist();
  
  console.log("AudioPlayerContext: randomMode =", randomMode, "playlist tracks =", sortedPlaylistTracks.length);
  
  // Sync random mode with prop changes
  useEffect(() => {
    console.log("AudioPlayerContext: Syncing randomMode from prop:", initialRandomMode);
    setRandomMode(initialRandomMode);
  }, [initialRandomMode]);

  // Enhanced random track selection
  const getNextTrack = (currentTrack: Track | null): Track | null => {
    const playlistTracks = sortedPlaylistTracks;
    console.log("getNextTrack: randomMode =", randomMode, "playlist tracks =", playlistTracks.length);
    
    if (!currentTrack || playlistTracks.length <= 1) {
      console.log("getNextTrack: No next track - insufficient tracks");
      return null;
    }
    
    const currentIndex = playlistTracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) {
      console.log("getNextTrack: Current track not found in playlist");
      return null;
    }
    
    let nextIndex;
    if (randomMode) {
      console.log("getNextTrack: Using random selection");
      const availableIndices = playlistTracks.map((_, i) => i).filter(i => i !== currentIndex);
      if (availableIndices.length === 0) return null;
      const randomChoice = Math.floor(Math.random() * availableIndices.length);
      nextIndex = availableIndices[randomChoice];
      console.log("getNextTrack: Random selection - chosen index:", nextIndex);
    } else {
      console.log("getNextTrack: Using sequential selection");
      nextIndex = (currentIndex + 1) % playlistTracks.length;
    }
    
    const nextTrack = playlistTracks[nextIndex] || null;
    console.log("getNextTrack: Selected track:", nextTrack?.name);
    return nextTrack;
  };

  const getPreviousTrack = (currentTrack: Track | null): Track | null => {
    const playlistTracks = sortedPlaylistTracks;
    console.log("getPreviousTrack: randomMode =", randomMode, "playlist tracks =", playlistTracks.length);
    
    if (!currentTrack || playlistTracks.length <= 1) {
      console.log("getPreviousTrack: No previous track - insufficient tracks");
      return null;
    }
    
    const currentIndex = playlistTracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) {
      console.log("getPreviousTrack: Current track not found in playlist");
      return null;
    }
    
    let prevIndex;
    if (randomMode) {
      console.log("getPreviousTrack: Using random selection");
      const availableIndices = playlistTracks.map((_, i) => i).filter(i => i !== currentIndex);
      if (availableIndices.length === 0) return null;
      const randomChoice = Math.floor(Math.random() * availableIndices.length);
      prevIndex = availableIndices[randomChoice];
      console.log("getPreviousTrack: Random selection - chosen index:", prevIndex);
    } else {
      console.log("getPreviousTrack: Using sequential selection");
      prevIndex = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
    }
    
    const prevTrack = playlistTracks[prevIndex] || null;
    console.log("getPreviousTrack: Selected track:", prevTrack?.name);
    return prevTrack;
  };

  // Enhanced next/previous handlers
  const handleNext = () => {
    console.log("handleNext: Current track:", currentTrack?.name, "Random mode:", randomMode);
    
    const nextTrack = getNextTrack(currentTrack);
    if (nextTrack) {
      console.log("handleNext: Playing next track:", nextTrack.name);
      setCurrentTrack(nextTrack);
      
      // Update media session metadata
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: nextTrack.name,
          artist: nextTrack.language || 'Radio Station',
          album: 'uRadio'
        });
      }
    } else {
      console.log("handleNext: No next track available");
    }
  };

  const handlePrevious = () => {
    console.log("handlePrevious: Current track:", currentTrack?.name, "Random mode:", randomMode);
    
    const prevTrack = getPreviousTrack(currentTrack);
    if (prevTrack) {
      console.log("handlePrevious: Playing previous track:", prevTrack.name);
      setCurrentTrack(prevTrack);
      
      // Update media session metadata
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: prevTrack.name,
          artist: prevTrack.language || 'Radio Station',
          album: 'uRadio'
        });
      }
    } else {
      console.log("handlePrevious: No previous track available");
    }
  };

  // Get URLs for player core
  const urls = currentTrack ? [currentTrack.url] : [];
  const playerCurrentIndex = currentTrack ? 0 : -1;

  // Use player core with enhanced handlers and proper volume initialization
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

  // Setup media session when track changes
  useEffect(() => {
    if (currentTrack && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.language || 'Radio Station',
        album: 'uRadio'
      });
      
      // Set action handlers
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
        handleNext();
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        logger.info("External control: previous track", { randomMode });
        handlePrevious();
      });
    }
  }, [currentTrack, randomMode]);

  // Player control functions
  const playTrack = (track: Track) => {
    logger.info("User requested to play track", { name: track.name });
    
    if (currentTrack?.url === track.url) {
      coreHandlePlayPause();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    logger.info("User paused playback");
    setIsPlaying(false);
  };

  const resumePlayback = () => {
    if (!currentTrack) return;
    logger.info("User resumed playback");
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    logger.info("User toggled play/pause");
    coreHandlePlayPause();
  };

  const nextTrack = () => {
    logger.info("User clicked next track", { randomMode });
    handleNext();
  };

  const previousTrack = () => {
    logger.info("User clicked previous track", { randomMode });
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
