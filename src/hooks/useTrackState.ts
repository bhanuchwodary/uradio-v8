
import { useState, useEffect } from "react";
import { Track } from "@/types/track";

export const useTrackState = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('musicTracks', JSON.stringify(tracks));
    console.log("Tracks state updated and saved to localStorage:", tracks);
  }, [tracks]);

  const addUrl = (url: string, name: string = "", isPrebuilt: boolean = false, isFavorite?: boolean) => {
    if (!url) {
      console.error("Cannot add empty URL");
      return;
    }
    
    const newTrack = { 
      url, 
      name: name || `Station ${tracks.length + 1}`,
      isFavorite: isFavorite === undefined ? false : isFavorite,
      playTime: 0,
      isPrebuilt
    };
    
    console.log("Adding or updating track in playlist:", newTrack);
    console.log("Adding with explicit isFavorite value:", isFavorite);
    
    // Important: Use a callback with the previous state to ensure we're working with the latest state
    setTracks(prevTracks => {
      // First, check for duplicates by URL (case insensitive comparison for robustness)
      const existingIndex = prevTracks.findIndex(
        track => track.url.toLowerCase() === url.toLowerCase()
      );
      
      console.log("Checking for existing track with URL:", url);
      console.log("Existing track index:", existingIndex);
      
      if (existingIndex !== -1) {
        // If found, create a new array and update the existing station
        console.log("Station already exists, updating at index:", existingIndex);
        console.log("Current station favorite status:", prevTracks[existingIndex].isFavorite);
        
        const updatedTracks = [...prevTracks];
        // The critical fix: Only update specific properties, NEVER touch isFavorite unless explicitly provided
        updatedTracks[existingIndex] = {
          ...updatedTracks[existingIndex],  // Keep all existing properties first
          url: url,  // Then update what we need to update
          name: name || updatedTracks[existingIndex].name,
          isPrebuilt: isPrebuilt !== undefined ? isPrebuilt : updatedTracks[existingIndex].isPrebuilt,
          // ONLY update isFavorite if it's explicitly provided
          isFavorite: isFavorite !== undefined ? isFavorite : updatedTracks[existingIndex].isFavorite
        };
        
        console.log("Updated track with favorite status:", updatedTracks[existingIndex].isFavorite);
        return updatedTracks;
      } else {
        // If not found, add as a new station
        console.log("Station doesn't exist, adding as new");
        return [...prevTracks, newTrack];
      }
    });
  };

  const getUserStations = () => {
    return tracks.filter(track => !track.isPrebuilt);
  };

  const updatePlayTime = (index: number, seconds: number) => {
    setTracks((prevTracks) => {
      const newTracks = [...prevTracks];
      if (newTracks[index]) {
        newTracks[index] = {
          ...newTracks[index],
          playTime: (newTracks[index].playTime || 0) + seconds
        };
      }
      return newTracks;
    });
  };

  const getTopStations = () => {
    return [...tracks]
      .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
      .slice(0, 5);
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
      
      if (index === currentIndex) {
        if (newTracks.length > 0) {
          setCurrentIndex(Math.min(currentIndex, newTracks.length - 1));
        } else {
          setCurrentIndex(0);
          setIsPlaying(false);
        }
      } else if (index < currentIndex) {
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
        console.log(`Toggled favorite status for station at index ${index} to ${newTracks[index].isFavorite}`);
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
    updatePlayTime,
    getTopStations,
    getUserStations,
  };
};
