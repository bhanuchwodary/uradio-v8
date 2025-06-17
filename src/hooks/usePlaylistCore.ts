
import { useState, useEffect } from "react";
import { Track } from "@/types/track";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { logger } from "@/utils/logger";

// Playlist storage key
const PLAYLIST_STORAGE_KEY = 'uradio_playlist';

export interface PlaylistTrack extends Track {
  addedToPlaylistAt?: number; // Timestamp when added to playlist
}

export const usePlaylistCore = () => {
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([]);
  const { tracks: allTracks, addUrl } = useTrackStateContext();

  // Load playlist from localStorage on init
  useEffect(() => {
    try {
      const savedPlaylist = localStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (savedPlaylist) {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylistTracks(parsed);
        logger.debug("Loaded playlist from storage", { count: parsed.length });
      }
    } catch (error) {
      logger.error("Error loading playlist from storage", error);
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlistTracks));
      logger.debug("Saved playlist to storage", { count: playlistTracks.length });
    } catch (error) {
      logger.error("Error saving playlist to storage", error);
    }
  }, [playlistTracks]);

  // Add track to playlist with enhanced duplicate prevention
  const addToPlaylist = (track: Track): boolean => {
    // Check for duplicates more strictly - compare both URL and name
    const exists = playlistTracks.some(t => 
      t.url.toLowerCase().trim() === track.url.toLowerCase().trim() &&
      t.name.toLowerCase().trim() === track.name.toLowerCase().trim()
    );
    
    if (exists) {
      logger.warn("Track already in playlist", { url: track.url, name: track.name });
      return false;
    }

    // If this is a featured station, ensure it exists in main library first
    const existsInLibrary = allTracks.some(t => t.url === track.url);
    if (!existsInLibrary) {
      logger.info("Adding featured station to main library first", { name: track.name });
      // Add to main library without triggering playback
      const result = addUrl(track.url, track.name, track.isFeatured || false, track.isFavorite || false, track.language || "");
      if (!result.success) {
        logger.error("Failed to add featured station to library", { error: result.message });
        return false;
      }
    }

    const playlistTrack: PlaylistTrack = {
      ...track,
      addedToPlaylistAt: Date.now()
    };

    setPlaylistTracks(prev => {
      // Double-check for duplicates before adding
      const alreadyExists = prev.some(t => 
        t.url.toLowerCase().trim() === track.url.toLowerCase().trim() &&
        t.name.toLowerCase().trim() === track.name.toLowerCase().trim()
      );
      
      if (alreadyExists) {
        logger.warn("Duplicate prevented during state update", { url: track.url });
        return prev;
      }
      
      return [...prev, playlistTrack];
    });
    
    logger.info("Added track to playlist", { name: track.name });
    return true;
  };

  // Remove track from playlist (does not affect main library)
  const removeFromPlaylist = (trackUrl: string): boolean => {
    const exists = playlistTracks.some(t => t.url === trackUrl);
    if (!exists) {
      logger.warn("Track not found in playlist", { url: trackUrl });
      return false;
    }

    setPlaylistTracks(prev => prev.filter(t => t.url !== trackUrl));
    logger.info("Removed track from playlist", { url: trackUrl });
    return true;
  };

  // Clear entire playlist (does not affect main library)
  const clearPlaylist = (): number => {
    const count = playlistTracks.length;
    setPlaylistTracks([]);
    logger.info("Cleared playlist", { removedCount: count });
    return count;
  };

  // Check if track is in playlist
  const isInPlaylist = (trackUrl: string): boolean => {
    return playlistTracks.some(t => t.url === trackUrl);
  };

  // Get playlist track by URL
  const getPlaylistTrack = (trackUrl: string): PlaylistTrack | undefined => {
    return playlistTracks.find(t => t.url === trackUrl);
  };

  return {
    playlistTracks,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    isInPlaylist,
    getPlaylistTrack,
    playlistCount: playlistTracks.length
  };
};
