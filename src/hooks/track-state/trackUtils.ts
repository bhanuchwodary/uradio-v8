
import { Track } from "@/types/track";
import { featuredStations } from "@/data/featuredStations";

export const getUserStations = (tracks: Track[]): Track[] => {
  return tracks.filter(track => !track.isFeatured);
};

export const getTopStations = (tracks: Track[]): Track[] => {
  return [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 5);
};

export const checkIfStationExists = (url: string, tracks: Track[]): { exists: boolean, isUserStation: boolean } => {
  // CRITICAL FIX: Ensure case-insensitive comparison
  // Check in user tracks
  const existsInUserTracks = tracks.some(track => 
    track.url.toLowerCase() === url.toLowerCase() && !track.isFeatured
  );
  
  if (existsInUserTracks) {
    return { exists: true, isUserStation: true };
  }
  
  // Check in featured stations
  const existsInFeatured = featuredStations.some(
    station => station.url.toLowerCase() === url.toLowerCase()
  );
  
  return { exists: existsInFeatured, isUserStation: false };
};
