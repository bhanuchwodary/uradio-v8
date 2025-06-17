
import { useState, useEffect } from "react";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlaylistCore } from "@/hooks/usePlaylistCore";
import { Track } from "@/types/track";

export const usePlaylistState = () => {
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Track | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  
  // Get main library tracks for playback control
  const { 
    tracks: libraryTracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    toggleFavorite
  } = useTrackStateContext();
  
  // Get playlist-specific functionality
  const {
    playlistTracks,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    isInPlaylist,
    playlistCount
  } = usePlaylistCore();
  
  // Split library stations into different categories
  const userStations = libraryTracks.filter(track => !track.isFeatured);
  const featuredStations = libraryTracks.filter(track => track.isFeatured);
  const favoriteStations = libraryTracks.filter(track => track.isFavorite);
  
  // Calculate popular stations based on play time from library
  const popularStations = [...libraryTracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);
  
  // Add effect for smooth transition on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate current track from library
  const currentTrack = libraryTracks[currentIndex] || null;

  return {
    editingStation,
    setEditingStation,
    stationToDelete,
    setStationToDelete,
    showClearDialog,
    setShowClearDialog,
    isPageReady,
    // Library tracks for playback
    tracks: libraryTracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    toggleFavorite,
    // Categorized library stations
    userStations,
    featuredStations,
    favoriteStations,
    popularStations,
    currentTrack,
    // Playlist-specific functionality
    playlistTracks,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    isInPlaylist,
    playlistCount
  };
};
