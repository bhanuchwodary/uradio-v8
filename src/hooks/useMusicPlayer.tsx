
import { useState, useEffect } from "react";
import androidAutoService from "../services/androidAutoService";

interface Track {
  url: string;
  name: string;
  isFavorite: boolean;
}

export const useMusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackDuration, setTrackDuration] = useState(0);
  const [trackPosition, setTrackPosition] = useState(0);

  // Get urls array for backward compatibility
  const urls = tracks.map(track => track.url);

  // Initialize Android Auto service
  useEffect(() => {
    androidAutoService.initialize();

    // Register callbacks for Android Auto and media controls
    androidAutoService.registerCallbacks({
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
      onSkipNext: () => handleSkipNext(),
      onSkipPrevious: () => handleSkipPrevious(),
      onSeek: (position) => {
        setTrackPosition(position);
        // The actual seeking is handled by the MusicPlayer component
        // which watches for changes to trackPosition
      }
    });

    // Enable background audio playback
    // In a real native app, this would use the native Audio API
    // with the appropriate permissions for background playback
    
    return () => {
      androidAutoService.cleanup();
    };
  }, []);

  // Update Android Auto with current track info
  useEffect(() => {
    if (tracks.length > 0 && currentIndex < tracks.length) {
      const currentTrack = tracks[currentIndex];
      
      androidAutoService.updateTrackInfo({
        title: currentTrack.name || `Track ${currentIndex + 1}`,
        artist: "Streamify Jukebox",
        album: "My Stations",
        duration: trackDuration,
        position: trackPosition,
        // In a real app, we would add artwork here
      });
    }
  }, [tracks, currentIndex, trackDuration, trackPosition]);

  // Update Android Auto with playback state
  useEffect(() => {
    androidAutoService.updatePlaybackState(isPlaying);
  }, [isPlaying]);

  // Load tracks from localStorage on init
  useEffect(() => {
    const savedTracks = localStorage.getItem('musicTracks');
    if (savedTracks) {
      try {
        setTracks(JSON.parse(savedTracks));
      } catch (error) {
        console.error("Error loading saved tracks:", error);
      }
    }
  }, []);

  // Save tracks to localStorage on change
  useEffect(() => {
    localStorage.setItem('musicTracks', JSON.stringify(tracks));
  }, [tracks]);

  // Add a new URL to the playlist
  const addUrl = (url: string, name: string = "") => {
    setTracks((prevTracks) => [
      ...prevTracks, 
      { 
        url, 
        name: name || `Station ${prevTracks.length + 1}`,
        isFavorite: false
      }
    ]);
  };

  // Edit a track in the playlist
  const editTrack = (index: number, data: { url: string; name: string }) => {
    setTracks((prevTracks) => {
      const newTracks = [...prevTracks];
      if (newTracks[index]) {
        newTracks[index] = {
          ...newTracks[index],
          url: data.url,
          name: data.name || `Station ${index + 1}`
        };
      }
      return newTracks;
    });
  };

  // Remove a URL from the playlist
  const removeUrl = (index: number) => {
    setTracks((prevTracks) => {
      const newTracks = [...prevTracks];
      newTracks.splice(index, 1);
      
      // If we removed the current track
      if (index === currentIndex) {
        if (newTracks.length > 0) {
          // If we have tracks left, either stay at same index (if in bounds) or go to last track
          setCurrentIndex(Math.min(currentIndex, newTracks.length - 1));
        } else {
          // If no tracks left, reset to 0 and stop playback
          setCurrentIndex(0);
          setIsPlaying(false);
        }
      } else if (index < currentIndex) {
        // If we removed a track before the current one, adjust index
        setCurrentIndex(currentIndex - 1);
      }
      
      return newTracks;
    });
  };

  // Toggle favorite status for a track
  const toggleFavorite = (index: number) => {
    setTracks((prevTracks) => {
      const newTracks = [...prevTracks];
      if (newTracks[index]) {
        newTracks[index] = {
          ...newTracks[index],
          isFavorite: !newTracks[index].isFavorite
        };
      }
      return newTracks;
    });
  };

  // Skip to next track
  const handleSkipNext = () => {
    if (tracks.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    }
  };

  // Skip to previous track
  const handleSkipPrevious = () => {
    if (tracks.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    }
  };

  // Update track progress
  const updateTrackProgress = (duration: number, position: number) => {
    setTrackDuration(duration);
    setTrackPosition(position);
  };

  // Seek to a specific position
  const seekTo = (position: number) => {
    setTrackPosition(position);
  };

  return {
    tracks,
    urls, // Keep for backward compatibility
    currentIndex,
    isPlaying,
    trackPosition,
    trackDuration,
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
    setCurrentIndex,
    setIsPlaying,
    updateTrackProgress,
    seekTo,
  };
};
