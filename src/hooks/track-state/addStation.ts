
import { Track } from "@/types/track";

export interface AddStationResult {
  success: boolean;
  message: string;
  addedIndex?: number; // FIXED: Add index of newly added station
}

export const addStationUrl = (
  url: string,
  name: string = "",
  isFeatured: boolean = false,
  isFavorite: boolean = false,
  existingTracks: Track[] = [],
  language: string = "",
  inPlaylist: boolean = false
): { tracks: Track[], result: AddStationResult } => {
  console.log("addStationUrl called with:", { url, name, isFeatured, isFavorite, language, inPlaylist });
  
  if (!url || typeof url !== 'string') {
    return {
      tracks: existingTracks,
      result: { success: false, message: "Invalid URL provided" }
    };
  }

  const cleanedUrl = url.trim();
  if (!cleanedUrl) {
    return {
      tracks: existingTracks,
      result: { success: false, message: "URL cannot be empty" }
    };
  }

  // Check if URL already exists (case-insensitive)
  const existingIndex = existingTracks.findIndex(
    track => track.url.toLowerCase() === cleanedUrl.toLowerCase()
  );

  if (existingIndex !== -1) {
    return {
      tracks: existingTracks,
      result: { 
        success: false, 
        message: "Station already exists in your list",
        addedIndex: existingIndex
      }
    };
  }

  // Create new track
  const newTrack: Track = {
    url: cleanedUrl,
    name: name || `Station ${existingTracks.length + 1}`,
    isFavorite: isFavorite || false,
    playTime: 0,
    isFeatured: isFeatured || false,
    language: language || "Unknown",
    inPlaylist: inPlaylist || false
  };

  console.log("Creating new track:", JSON.stringify(newTrack));
  
  const updatedTracks = [...existingTracks, newTrack];
  const addedIndex = updatedTracks.length - 1;
  
  console.log("Track added successfully at index:", addedIndex);
  
  return {
    tracks: updatedTracks,
    result: { 
      success: true, 
      message: "Station added successfully",
      addedIndex
    }
  };
};
