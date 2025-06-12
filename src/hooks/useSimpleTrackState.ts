
import { useState, useEffect, useCallback } from 'react';
import { Track } from '@/types/track';

const STORAGE_KEY = 'streamify_tracks';

interface SimpleTrackState {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  addTrack: (track: Omit<Track, 'playTime'>) => void;
  removeTrack: (index: number) => void;
  updateTrack: (index: number, updates: Partial<Track>) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  clearAllTracks: () => void;
}

export const useSimpleTrackState = (): SimpleTrackState => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load tracks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedTracks = JSON.parse(saved);
        setTracks(parsedTracks);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  }, []);

  // Save tracks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    } catch (error) {
      console.error('Error saving tracks:', error);
    }
  }, [tracks]);

  const addTrack = useCallback((newTrack: Omit<Track, 'playTime'>) => {
    setTracks(prev => {
      // Check if track already exists
      const exists = prev.some(track => track.url === newTrack.url);
      if (exists) return prev;
      
      return [...prev, { ...newTrack, playTime: 0 }];
    });
  }, []);

  const removeTrack = useCallback((index: number) => {
    setTracks(prev => {
      const newTracks = prev.filter((_, i) => i !== index);
      
      // Adjust current index if needed
      if (index === currentIndex && newTracks.length > 0) {
        setCurrentIndex(Math.min(currentIndex, newTracks.length - 1));
      } else if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      } else if (newTracks.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(false);
      }
      
      return newTracks;
    });
  }, [currentIndex]);

  const updateTrack = useCallback((index: number, updates: Partial<Track>) => {
    setTracks(prev => 
      prev.map((track, i) => 
        i === index ? { ...track, ...updates } : track
      )
    );
  }, []);

  const clearAllTracks = useCallback(() => {
    setTracks([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  return {
    tracks,
    currentIndex,
    isPlaying,
    addTrack,
    removeTrack,
    updateTrack,
    setCurrentIndex,
    setIsPlaying,
    clearAllTracks
  };
};
