
import { useContext } from "react";
import { Track } from "@/types/track";
import { logger } from "@/utils/logger";

// Create a separate hook for playlist navigation to avoid circular dependencies
export const usePlaylistNavigation = () => {
  const getPlaylistTracks = (): Track[] => {
    try {
      // Dynamically import playlist context to avoid circular dependency
      const PlaylistContext = require("@/context/PlaylistContext");
      const context = React.useContext(PlaylistContext.PlaylistContext);
      return context?.playlistTracks || [];
    } catch (error) {
      logger.warn("Could not access playlist context", error);
      return [];
    }
  };

  const getNextTrack = (currentTrack: Track | null, randomMode: boolean): Track | null => {
    const playlistTracks = getPlaylistTracks();
    
    if (!currentTrack || playlistTracks.length <= 1) return null;
    
    const currentIndex = playlistTracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) return null;
    
    let nextIndex;
    if (randomMode) {
      do {
        nextIndex = Math.floor(Math.random() * playlistTracks.length);
      } while (nextIndex === currentIndex && playlistTracks.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % playlistTracks.length;
    }
    
    return playlistTracks[nextIndex] || null;
  };

  const getPreviousTrack = (currentTrack: Track | null, randomMode: boolean): Track | null => {
    const playlistTracks = getPlaylistTracks();
    
    if (!currentTrack || playlistTracks.length <= 1) return null;
    
    const currentIndex = playlistTracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) return null;
    
    let prevIndex;
    if (randomMode) {
      do {
        prevIndex = Math.floor(Math.random() * playlistTracks.length);
      } while (prevIndex === currentIndex && playlistTracks.length > 1);
    } else {
      prevIndex = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
    }
    
    return playlistTracks[prevIndex] || null;
  };

  return {
    getPlaylistTracks,
    getNextTrack,
    getPreviousTrack
  };
};
