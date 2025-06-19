
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
    console.log("RANDOM MODE DEBUG: getNextTrack called", { 
      currentTrack: currentTrack?.name, 
      randomMode, 
      totalTracks: tracks.length 
    });
    
    if (!currentTrack || tracks.length <= 1) {
      console.log("RANDOM MODE DEBUG: No next track - insufficient tracks");
      return null;
    }
    
    const currentIndex = tracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) {
      console.log("RANDOM MODE DEBUG: Current track not found in playlist");
      return null;
    }
    
    let nextIndex;
    if (randomMode) {
      console.log("RANDOM MODE DEBUG: Using random selection");
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
        console.log("RANDOM MODE DEBUG: Generated random index:", nextIndex);
      } while (nextIndex === currentIndex && tracks.length > 1);
    } else {
      console.log("RANDOM MODE DEBUG: Using sequential selection");
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    
    const nextTrack = tracks[nextIndex] || null;
    console.log("RANDOM MODE DEBUG: Selected next track:", {
      nextIndex,
      trackName: nextTrack?.name,
      randomMode
    });
    
    return nextTrack;
  };

  const getPreviousTrack = (currentTrack: Track | null, randomMode: boolean): Track | null => {
    const tracks = getPlaylistTracks();
    console.log("RANDOM MODE DEBUG: getPreviousTrack called", { 
      currentTrack: currentTrack?.name, 
      randomMode, 
      totalTracks: tracks.length 
    });
    
    if (!currentTrack || tracks.length <= 1) {
      console.log("RANDOM MODE DEBUG: No previous track - insufficient tracks");
      return null;
    }
    
    const currentIndex = tracks.findIndex(t => t.url === currentTrack.url);
    if (currentIndex === -1) {
      console.log("RANDOM MODE DEBUG: Current track not found in playlist");
      return null;
    }
    
    let prevIndex;
    if (randomMode) {
      console.log("RANDOM MODE DEBUG: Using random selection for previous");
      do {
        prevIndex = Math.floor(Math.random() * tracks.length);
        console.log("RANDOM MODE DEBUG: Generated random index for previous:", prevIndex);
      } while (prevIndex === currentIndex && tracks.length > 1);
    } else {
      console.log("RANDOM MODE DEBUG: Using sequential selection for previous");
      prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    }
    
    const prevTrack = tracks[prevIndex] || null;
    console.log("RANDOM MODE DEBUG: Selected previous track:", {
      prevIndex,
      trackName: prevTrack?.name,
      randomMode
    });
    
    return prevTrack;
  };

  return {
    getPlaylistTracks,
    getNextTrack,
    getPreviousTrack
  };
};
