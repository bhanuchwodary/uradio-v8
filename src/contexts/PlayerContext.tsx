
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AudioEngine, AudioState, AudioTrack } from '../core/AudioEngine';
import { TrackManager, Track } from '../core/TrackManager';
import { PlaylistManager, PlaylistTrack } from '../core/PlaylistManager';

interface PlayerContextType {
  // Audio state
  audioState: AudioState;
  
  // Track management
  tracks: Track[];
  favorites: Track[];
  
  // Playlist management  
  playlist: PlaylistTrack[];
  
  // Player controls
  play: (track?: Track) => Promise<void>;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  
  // Navigation
  nextTrack: () => void;
  previousTrack: () => void;
  
  // Track management
  addTrack: (track: Omit<Track, 'id' | 'addedAt'>) => Track;
  removeTrack: (id: string) => boolean;
  updateTrack: (id: string, updates: Partial<Track>) => boolean;
  toggleFavorite: (id: string) => boolean;
  
  // Playlist management
  addToPlaylist: (track: Track) => boolean;
  removeFromPlaylist: (id: string) => boolean;
  clearPlaylist: () => number;
  isInPlaylist: (id: string) => boolean;
  
  // State
  randomMode: boolean;
  setRandomMode: (random: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audioState, setAudioState] = useState<AudioState>(AudioEngine.getState());
  const [tracks, setTracks] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);
  const [randomMode, setRandomMode] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Track[]>([]);

  // Subscribe to audio engine state changes
  useEffect(() => {
    const unsubscribe = AudioEngine.subscribe(setAudioState);
    return unsubscribe;
  }, []);

  // Subscribe to track manager changes
  useEffect(() => {
    const unsubscribe = TrackManager.subscribe((newTracks) => {
      setTracks(newTracks);
      setFavorites(newTracks.filter(t => t.isFavorite));
    });
    return unsubscribe;
  }, []);

  // Subscribe to playlist manager changes
  useEffect(() => {
    const unsubscribe = PlaylistManager.subscribe(setPlaylist);
    return unsubscribe;
  }, []);

  // Update current playlist based on context (favorites, all tracks, or playlist)
  useEffect(() => {
    if (playlist.length > 0) {
      setCurrentPlaylist(playlist);
    } else if (favorites.length > 0) {
      setCurrentPlaylist(favorites);
    } else {
      setCurrentPlaylist(tracks);
    }
  }, [playlist, favorites, tracks]);

  // Track play time
  useEffect(() => {
    if (audioState.isPlaying && audioState.currentTrack) {
      const interval = setInterval(() => {
        TrackManager.incrementPlayTime(audioState.currentTrack!.id, 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [audioState.isPlaying, audioState.currentTrack]);

  const play = useCallback(async (track?: Track) => {
    if (track) {
      await AudioEngine.loadTrack(track);
    }
    await AudioEngine.play();
  }, []);

  const pause = useCallback(() => {
    AudioEngine.pause();
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (audioState.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [audioState.isPlaying, play, pause]);

  const getNextTrack = useCallback((): Track | null => {
    if (!audioState.currentTrack || currentPlaylist.length <= 1) return null;
    
    const currentIndex = currentPlaylist.findIndex(t => t.id === audioState.currentTrack!.id);
    if (currentIndex === -1) return null;
    
    if (randomMode) {
      const availableIndices = currentPlaylist.map((_, i) => i).filter(i => i !== currentIndex);
      if (availableIndices.length === 0) return null;
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      return currentPlaylist[randomIndex];
    } else {
      const nextIndex = (currentIndex + 1) % currentPlaylist.length;
      return currentPlaylist[nextIndex];
    }
  }, [audioState.currentTrack, currentPlaylist, randomMode]);

  const getPreviousTrack = useCallback((): Track | null => {
    if (!audioState.currentTrack || currentPlaylist.length <= 1) return null;
    
    const currentIndex = currentPlaylist.findIndex(t => t.id === audioState.currentTrack!.id);
    if (currentIndex === -1) return null;
    
    if (randomMode) {
      const availableIndices = currentPlaylist.map((_, i) => i).filter(i => i !== currentIndex);
      if (availableIndices.length === 0) return null;
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      return currentPlaylist[randomIndex];
    } else {
      const prevIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
      return currentPlaylist[prevIndex];
    }
  }, [audioState.currentTrack, currentPlaylist, randomMode]);

  const nextTrack = useCallback(async () => {
    const next = getNextTrack();
    if (next) {
      await play(next);
    }
  }, [getNextTrack, play]);

  const previousTrack = useCallback(async () => {
    const previous = getPreviousTrack();
    if (previous) {
      await play(previous);
    }
  }, [getPreviousTrack, play]);

  // Setup media session handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
      navigator.mediaSession.setActionHandler('previoustrack', previousTrack);
    }
  }, [nextTrack, previousTrack]);

  const contextValue: PlayerContextType = {
    audioState,
    tracks,
    favorites,
    playlist,
    play,
    pause,
    togglePlayPause,
    setVolume: AudioEngine.setVolume.bind(AudioEngine),
    seek: AudioEngine.seek.bind(AudioEngine),
    nextTrack,
    previousTrack,
    addTrack: TrackManager.addTrack.bind(TrackManager),
    removeTrack: TrackManager.removeTrack.bind(TrackManager),
    updateTrack: TrackManager.updateTrack.bind(TrackManager),
    toggleFavorite: TrackManager.toggleFavorite.bind(TrackManager),
    addToPlaylist: PlaylistManager.addToPlaylist.bind(PlaylistManager),
    removeFromPlaylist: PlaylistManager.removeFromPlaylist.bind(PlaylistManager),
    clearPlaylist: PlaylistManager.clearPlaylist.bind(PlaylistManager),
    isInPlaylist: PlaylistManager.isInPlaylist.bind(PlaylistManager),
    randomMode,
    setRandomMode,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
