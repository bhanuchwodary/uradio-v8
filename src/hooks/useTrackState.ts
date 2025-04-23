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
  }, [tracks]);

  const addUrl = (url: string, name: string = "", isPrebuilt: boolean = false) => {
    if (!url) {
      console.error("Cannot add empty URL");
      return;
    }
    
    const newTrack = { 
      url, 
      name: name || `Station ${tracks.length + 1}`,
      isFavorite: false,
      playTime: 0,
      isPrebuilt
    };
    
    setTracks(prevTracks => {
      const updatedTracks = [...prevTracks, newTrack];
      console.log("Track added:", newTrack);
      return updatedTracks;
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
