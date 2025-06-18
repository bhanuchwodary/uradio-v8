
import React, { useContext } from "react";
import { Track } from "@/types/track";
import { usePlaylist } from "@/context/PlaylistContext";
import { logger } from "@/utils/logger";

// Create a separate hook for playlist navigation to avoid circular dependencies
export const usePlaylistNavigation = () => {
  const { playlistTracks } = usePlaylist();

  const getPlaylistTracks = (): Track[] => {
    return playlistTracks || [];
  };

  const getNextTrack = (currentTrack: Track | null, randomMode: boolean): Track | null => {
    const tracks = getPlaylistTracks();
    
    if (!currentTrack || tracks.length <= 1) return null;
    
    const currentIndex = tracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) return null;
    
    let nextIndex;
    if (randomMode) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex && tracks.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    
    return tracks[nextIndex] || null;
  };

  const getPreviousTrack = (currentTrack: Track | null, randomMode: boolean): Track | null => {
    const tracks = getPlaylistTracks();
    
    if (!currentTrack || tracks.length <= 1) return null;
    
    const currentIndex = tracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) return null;
    
    let prevIndex;
    if (randomMode) {
      do {
        prevIndex = Math.floor(Math.random() * tracks.length);
      } while (prevIndex === currentIndex && tracks.length > 1);
    } else {
      prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    }
    
    return tracks[prevIndex] || null;
  };

  return {
    getPlaylistTracks,
    getNextTrack,
    getPreviousTrack
  };
};
