
import { Track } from "@/types/track";

export const editTrackInfo = (
  tracks: Track[], 
  index: number, 
  data: { url: string; name: string; language?: string }
): Track[] => {
  // Create a new array to ensure state updates are detected
  const newTracks = JSON.parse(JSON.stringify(tracks));
  if (newTracks[index]) {
    newTracks[index] = {
      ...newTracks[index],
      url: data.url,
      name: data.name || `Station ${index + 1}`,
      // CRITICAL FIX: Preserve language properly during edits
      language: data.language !== undefined ? data.language : newTracks[index].language
    };
  }
  return newTracks;
};

export const editStationByValue = (
  tracks: Track[], 
  station: Track, 
  data: { url: string; name: string; language?: string }
): Track[] => {
  const index = tracks.findIndex(
    track => track.url === station.url && track.name === station.name
  );
  
  if (index !== -1) {
    // Create a new array to ensure state updates are detected
    const newTracks = JSON.parse(JSON.stringify(tracks));
    newTracks[index] = {
      ...newTracks[index],
      url: data.url,
      name: data.name,
      // CRITICAL FIX: Preserve language properly during edits
      language: data.language !== undefined ? data.language : newTracks[index].language
    };
    return newTracks;
  }
  
  return tracks;
};
