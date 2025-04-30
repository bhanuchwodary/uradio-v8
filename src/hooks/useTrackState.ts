
import { useState, useEffect } from "react";
import { Track } from "@/types/track";
import { prebuiltStations } from "@/data/prebuiltStations";

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

  const checkIfStationExists = (url: string): { exists: boolean, isUserStation: boolean } => {
    // Check in user tracks
    const existsInUserTracks = tracks.some(track => 
      track.url.toLowerCase() === url.toLowerCase() && !track.isPrebuilt
    );
    
    if (existsInUserTracks) {
      return { exists: true, isUserStation: true };
    }
    
    // Check in prebuilt stations
    const existsInPrebuilt = prebuiltStations.some(
      station => station.url.toLowerCase() === url.toLowerCase()
    );
    
    return { exists: existsInPrebuilt, isUserStation: false };
  };

  const addUrl = (url: string, name: string = "", isPrebuilt: boolean = false, isFavorite?: boolean) => {
    if (!url) {
      console.error("Cannot add empty URL");
      return { success: false, message: "URL cannot be empty" };
    }
    
    console.log(`Adding URL: ${url}, Name: ${name}, IsPrebuilt: ${isPrebuilt}, Explicit isFavorite: ${isFavorite !== undefined ? isFavorite : 'not provided'}`);
    
    // Check if the station already exists in user stations or prebuilt stations
    const stationExists = checkIfStationExists(url);
    
    if (stationExists.exists && stationExists.isUserStation && !isPrebuilt) {
      console.log("Station already exists in user stations:", url);
      return { success: false, message: "Station already exists in your stations" };
    } else if (stationExists.exists && !stationExists.isUserStation && !isPrebuilt) {
      console.log("Station already exists in prebuilt stations:", url);
      return { success: false, message: "Station already exists in prebuilt stations" };
    }
    
    // First, check for duplicates by URL in current playlist (case insensitive comparison for robustness)
    const existingIndex = tracks.findIndex(
      track => track.url.toLowerCase() === url.toLowerCase()
    );
    
    console.log("Checking for existing track in playlist with URL:", url);
    console.log("Existing track index:", existingIndex);
    
    if (existingIndex !== -1) {
      // If found, create a new array and update the existing station
      console.log("Station already exists in playlist, updating at index:", existingIndex);
      console.log("Current station favorite status:", tracks[existingIndex].isFavorite);
      
      setTracks(prevTracks => {
        const updatedTracks = [...prevTracks];
        // CRITICAL FIX: Only update specific properties, NEVER change isFavorite unless explicitly provided
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
      });
      return { success: true, message: "Station updated in playlist" };
    } else {
      // If not found, add as a new station
      console.log("Station doesn't exist in playlist, adding as new");
      const newTrack = { 
        url, 
        name: name || `Station ${tracks.length + 1}`,
        isFavorite: isFavorite !== undefined ? isFavorite : false,
        playTime: 0,
        isPrebuilt
      };
      console.log("New track being added:", newTrack);
      setTracks(prevTracks => [...prevTracks, newTrack]);
      return { success: true, message: "Station added to playlist" };
    }
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
  
  const editStationByValue = (station: Track, data: { url: string; name: string }) => {
    setTracks((prevTracks) => {
      const index = prevTracks.findIndex(
        track => track.url === station.url && track.name === station.name
      );
      
      if (index !== -1) {
        const newTracks = [...prevTracks];
        newTracks[index] = {
          ...newTracks[index],
          url: data.url,
          name: data.name
        };
        return newTracks;
      }
      
      return prevTracks;
    });
  };
  
  const removeStationByValue = (station: Track) => {
    setTracks((prevTracks) => {
      const index = prevTracks.findIndex(
        track => track.url === station.url && track.name === station.name
      );
      
      if (index !== -1) {
        const newTracks = [...prevTracks];
        newTracks.splice(index, 1);
        return newTracks;
      }
      
      return prevTracks;
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
        const newFavoriteStatus = !newTracks[index].isFavorite;
        newTracks[index] = {
          ...newTracks[index],
          isFavorite: newFavoriteStatus
        };
        console.log(`Toggled favorite status for station at index ${index} to ${newFavoriteStatus}`);
        console.log("Updated tracks array:", newTracks);
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
    checkIfStationExists,
    editStationByValue,
    removeStationByValue
  };
};
