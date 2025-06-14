
import { Track } from "@/types/track";

export const addStationUrl = (
  url: string, 
  name: string = "", 
  isFeatured: boolean = false, 
  isFavorite: boolean = false, 
  tracks: Track[],
  language: string = "",
  inPlaylist: boolean = false // Updated parameter
): { tracks: Track[], result: { success: boolean, message: string } } => {
  if (!url) {
    console.error("Cannot add empty URL");
    return { tracks, result: { success: false, message: "URL cannot be empty" } };
  }
  
  console.log(`Adding URL: ${url}, Name: ${name}, IsFeatured: ${isFeatured}, IsFavorite: ${isFavorite}, Language: ${language}`);
  console.log("Current tracks count before add:", tracks.length);
  
  // Create a deep clone of the tracks array to ensure we don't modify the original
  const tracksClone = JSON.parse(JSON.stringify(tracks));
  
  // First, check for duplicates by URL in current playlist (case insensitive comparison)
  const existingIndex = tracksClone.findIndex(
    (track: Track) => track.url.toLowerCase() === url.toLowerCase()
  );
  
  console.log("Existing track index:", existingIndex);
  
  let updatedTracks;
  let resultMessage;
  
  if (existingIndex !== -1) {
    // If found, create a new array and update the existing station
    console.log("Station already exists in playlist, updating at index:", existingIndex);
    
    // Create a completely new array to ensure React detects the state change
    updatedTracks = [...tracksClone];
    
    // Update all properties explicitly, ensuring language is preserved
    updatedTracks[existingIndex] = {
      ...updatedTracks[existingIndex],  // Keep existing properties first
      url: url,  // Then update what we need to update
      name: name || updatedTracks[existingIndex].name,
      isFeatured: isFeatured !== undefined ? isFeatured : updatedTracks[existingIndex].isFeatured,
      isFavorite: isFavorite !== undefined ? isFavorite : updatedTracks[existingIndex].isFavorite,
      // CRITICAL FIX: Ensure language is always preserved and not overwritten with empty string
      language: language || updatedTracks[existingIndex].language || "",
      playTime: updatedTracks[existingIndex].playTime || 0,
      inPlaylist: inPlaylist !== undefined ? inPlaylist : updatedTracks[existingIndex].inPlaylist || false
    };
    
    console.log("Updated station data with language:", updatedTracks[existingIndex].language);
    console.log("Updated station inPlaylist:", updatedTracks[existingIndex].inPlaylist);
    resultMessage = "Station updated in playlist";
  } else {
    // If not found, add as a new station
    console.log("Station doesn't exist in playlist, adding as new");
    const newTrack: Track = { 
      url, 
      name: name || `Station ${tracksClone.length + 1}`,
      isFavorite: !!isFavorite,
      playTime: 0,
      isFeatured: !!isFeatured,
      // CRITICAL FIX: Ensure language is always set and not lost
      language: language || "",
      inPlaylist: !!inPlaylist // Use the provided inPlaylist value
    };
    
    console.log("New track being added with language:", newTrack.language);
    console.log("New track being added with inPlaylist:", newTrack.inPlaylist);
    
    // Critical fix: create a fresh array to ensure state change detection
    updatedTracks = [...tracksClone, newTrack];
    resultMessage = "Station added to playlist";
  }
  
  console.log("Updated tracks array now has", updatedTracks.length, "tracks");
  
  // Sanity check our data before returning
  const hasInvalidTracks = updatedTracks.some((track: Track) => !track.url || !track.name);
  if (hasInvalidTracks) {
    console.error("Invalid tracks detected after adding/updating station");
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
