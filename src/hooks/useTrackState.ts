
import { useState, useEffect } from "react";
import { Track } from "@/types/track";

export const useTrackState = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  return {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
  };
};
