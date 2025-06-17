
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
  const { tracks: allTracks } = useTrackStateContext();

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

  // Add track to playlist
  const addToPlaylist = (track: Track): boolean => {
    const exists = playlistTracks.some(t => t.url === track.url);
    if (exists) {
      logger.warn("Track already in playlist", { url: track.url });
      return false;
    }

    const playlistTrack: PlaylistTrack = {
      ...track,
      addedToPlaylistAt: Date.now()
    };

    setPlaylistTracks(prev => [...prev, playlistTrack]);
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
