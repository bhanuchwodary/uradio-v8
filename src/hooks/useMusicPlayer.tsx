
import { useState, useEffect, useRef } from "react";
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
  
  // Store audio instance in a ref so it persists across route changes
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get urls array for backward compatibility
  const urls = tracks.map(track => track.url);

  // Initialize Android Auto service and create persistent audio
  useEffect(() => {
    // Create a single audio instance that persists for the app's lifetime
    if (!audioRef.current) {
      audioRef.current = new Audio();
      // Set audio to continue playing when app is in background
      if ('mediaSession' in navigator) {
        audioRef.current.setAttribute('playsinline', '');
        audioRef.current.setAttribute('autoplay', 'false');
      }
    }

    androidAutoService.initialize();

    // Register callbacks for Android Auto and media controls
    androidAutoService.registerCallbacks({
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
      onSkipNext: () => handleSkipNext(),
      onSkipPrevious: () => handleSkipPrevious(),
      onSeek: (position) => {
        setTrackPosition(position);
        if (audioRef.current) {
          audioRef.current.currentTime = position;
        }
      }
    });
    
    // This is a component mount effect, so we only want to clean up on unmount
    return () => {
      // Only clean up Android Auto integration, but preserve the audio element
      androidAutoService.cleanup();
    };
  }, []);

  // Update Android Auto with current track info
  useEffect(() => {
    if (tracks.length > 0 && currentIndex < tracks.length) {
      const currentTrack = tracks[currentIndex];
      const isLocalFile = currentTrack.url.startsWith('file:') || 
                          currentTrack.url.startsWith('blob:');
      
      androidAutoService.updateTrackInfo({
        title: currentTrack.name || `Track ${currentIndex + 1}`,
        artist: "Streamify Jukebox",
        album: isLocalFile ? "Local Files" : "My Stations",
        duration: trackDuration,
        position: trackPosition,
        isLocalFile: isLocalFile,
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
    
    // Restore last playing state if available
    const lastIndex = localStorage.getItem('lastPlayingIndex');
    if (lastIndex) {
      setCurrentIndex(parseInt(lastIndex, 10));
    }
  }, []);

  // Save tracks to localStorage on change
  useEffect(() => {
    localStorage.setItem('musicTracks', JSON.stringify(tracks));
  }, [tracks]);
  
  // Save current index to localStorage
  useEffect(() => {
    localStorage.setItem('lastPlayingIndex', currentIndex.toString());
  }, [currentIndex]);

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
    if (audioRef.current) {
      audioRef.current.currentTime = position;
    }
  };
  
  // Get the persistent audio element
  const getAudioElement = () => {
    return audioRef.current;
  };

  return {
    tracks,
    urls,
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
    getAudioElement,
  };
};
