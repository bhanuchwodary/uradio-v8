
import { useState, useEffect } from "react";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { Track } from "@/types/track";

export const usePlaylistState = () => {
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  
  const { 
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    toggleFavorite
  } = useTrackStateContext();
  
  // Split stations into different categories - ensure proper filtering
  const userStations = tracks.filter(track => !track.isFeatured);
  const featuredStations = tracks.filter(track => track.isFeatured);
  const favoriteStations = tracks.filter(track => track.isFavorite);
  
  // Calculate popular stations based on play time
  const popularStations = [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);
  
  // Add effect for smooth transition on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;

  return {
    editingStation,
    setEditingStation,
    stationToDelete,
    setStationToDelete,
    showClearDialog,
    setShowClearDialog,
    isPageReady,
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    toggleFavorite,
    userStations,
    featuredStations,
    favoriteStations,
    popularStations,
    currentTrack
  };
};
