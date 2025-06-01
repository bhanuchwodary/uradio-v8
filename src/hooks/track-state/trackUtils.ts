
import { Track } from "@/types/track";
import { fetchPrebuiltStations } from "@/services/prebuiltStationsService";

export const getUserStations = (tracks: Track[]): Track[] => {
  return tracks.filter(track => !track.isPrebuilt);
};

export const getTopStations = (tracks: Track[]): Track[] => {
  return [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 5);
};

export const checkIfStationExists = async (url: string, tracks: Track[]): Promise<{ exists: boolean, isUserStation: boolean }> => {
  // Check in user tracks first
  const existsInUserTracks = tracks.some(track => 
    track.url.toLowerCase() === url.toLowerCase() && !track.isPrebuilt
  );
  
  if (existsInUserTracks) {
    return { exists: true, isUserStation: true };
  }
  
  // Check in prebuilt stations from database
  try {
    const prebuiltStations = await fetchPrebuiltStations();
    const existsInPrebuilt = prebuiltStations.some(
      station => station.url.toLowerCase() === url.toLowerCase()
    );
    
    return { exists: existsInPrebuilt, isUserStation: false };
  } catch (error) {
    console.error("Error checking prebuilt stations:", error);
    return { exists: false, isUserStation: false };
  }
};
