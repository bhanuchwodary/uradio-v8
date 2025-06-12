
import { Track } from "@/types/track";

export const addStationUrl = (
  url: string, 
  name: string = "", 
  isFeatured: boolean = false, 
  isFavorite: boolean = false, 
  tracks: Track[],
  language: string = ""
): { tracks: Track[], result: { success: boolean, message: string } } => {
  if (!url) {
    console.error("addStationUrl - Cannot add empty URL");
    return { tracks, result: { success: false, message: "URL cannot be empty" } };
  }
  
  console.log(`addStationUrl - Adding URL: ${url}, Name: ${name}, IsFeatured: ${isFeatured}, IsFavorite: ${isFavorite}, Language: ${language}`);
  console.log("addStationUrl - Current tracks count before add:", tracks.length);
  
  // Create a deep clone of the tracks array to ensure we don't modify the original
  const tracksClone = JSON.parse(JSON.stringify(tracks));
  
  // First, check for duplicates by URL in current playlist (case insensitive comparison)
  const existingIndex = tracksClone.findIndex(
    (track: Track) => track.url.toLowerCase() === url.toLowerCase()
  );
  
  console.log("addStationUrl - Existing track index:", existingIndex);
  
  let updatedTracks;
  let resultMessage;
  
  if (existingIndex !== -1) {
    // If found, create a new array and update the existing station
    console.log("addStationUrl - Station already exists in playlist, updating at index:", existingIndex);
    
    // Create a completely new array to ensure React detects the state change
    updatedTracks = [...tracksClone];
    
    // Update all properties explicitly, ensuring featured status and language are preserved
    updatedTracks[existingIndex] = {
      ...updatedTracks[existingIndex],  // Keep existing properties first
      url: url,  // Then update what we need to update
      name: name || updatedTracks[existingIndex].name,
      // CRITICAL FIX: Preserve the isFeatured status - don't override it unless explicitly requested
      isFeatured: isFeatured !== undefined ? isFeatured : updatedTracks[existingIndex].isFeatured,
      isFavorite: isFavorite !== undefined ? isFavorite : updatedTracks[existingIndex].isFavorite,
      // CRITICAL FIX: Ensure language is always preserved and not overwritten with empty string
      language: language || updatedTracks[existingIndex].language || "",
      playTime: updatedTracks[existingIndex].playTime || 0
    };
    
    console.log("addStationUrl - Updated station data with featured status:", updatedTracks[existingIndex].isFeatured);
    resultMessage = "Station updated in playlist";
  } else {
    // If not found, add as a new station
    console.log("addStationUrl - Station doesn't exist in playlist, adding as new");
    const newTrack: Track = { 
      url, 
      name: name || `Station ${tracksClone.length + 1}`,
      isFavorite: !!isFavorite,
      playTime: 0,
      // CRITICAL FIX: Preserve the isFeatured status when adding new stations
      isFeatured: !!isFeatured,
      // CRITICAL FIX: Ensure language is always set and not lost
      language: language || ""
    };
    
    console.log("addStationUrl - New track being added with featured status:", JSON.stringify(newTrack));
    
    // Critical fix: create a fresh array to ensure state change detection
    updatedTracks = [...tracksClone, newTrack];
    resultMessage = "Station added to playlist";
  }
  
  console.log("addStationUrl - Updated tracks array now has", updatedTracks.length, "tracks");
  console.log("addStationUrl - All tracks after operation:", JSON.stringify(updatedTracks));
  
  // Sanity check our data before returning
  const hasInvalidTracks = updatedTracks.some((track: Track) => !track.url || !track.name);
  if (hasInvalidTracks) {
    console.error("addStationUrl - Invalid tracks detected after adding/updating station");
    return { 
      tracks: tracksClone, // Return original if something went wrong
      result: { success: false, message: "Error processing station data" } 
    };
  }
  
  return { 
    tracks: updatedTracks, 
    result: { success: true, message: resultMessage } 
  };
};
