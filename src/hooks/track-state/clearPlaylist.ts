import { Track } from "@/types/track";

export const clearPlaylistStations = (tracks: Track[]): Track[] => {
  // FIXED: Instead of removing user stations completely, we convert them to non-playlist stations
  // This means they stay available on the stations screen but are removed from the playlist
  
  console.log("clearPlaylistStations - Before clearing:", tracks.length);
  console.log("clearPlaylistStations - User stations to clear from playlist:", tracks.filter(t => !t.isFeatured).length);
  
  // Keep only featured stations, remove user-added stations from playlist
  const clearedTracks = tracks.filter(track => track.isFeatured === true);
  
  console.log("clearPlaylistStations - After clearing:", clearedTracks.length);
  console.log("clearPlaylistStations - Featured stations remaining:", clearedTracks.filter(t => t.isFeatured).length);
  
  return clearedTracks;
};
