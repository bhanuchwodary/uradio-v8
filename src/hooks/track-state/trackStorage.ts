
import { Track } from "@/types/track";

// Storage key for consistency
const TRACKS_STORAGE_KEY = 'musicTracks';

export const loadTracksFromLocalStorage = (): Track[] => {
  try {
    const savedTracks = localStorage.getItem(TRACKS_STORAGE_KEY);
    if (savedTracks) {
      const parsedTracks = JSON.parse(savedTracks);
      console.log("Loaded tracks from localStorage:", parsedTracks.length);
      if (parsedTracks.length > 0) {
        console.log("Sample track from localStorage:", parsedTracks[0]);
      }
      
      // Validate the tracks array
      if (!Array.isArray(parsedTracks)) {
        console.error("Loaded tracks is not an array:", parsedTracks);
        return [];
      }
      
      // Ensure all required properties are present
      const validatedTracks = parsedTracks.filter((track: any) => {
        const isValid = track && 
                        typeof track.url === 'string' && 
                        typeof track.name === 'string';
        if (!isValid) {
          console.error("Invalid track found:", track);
        }
        return isValid;
      });
      
      // Fill in any missing optional properties
      const normalizedTracks = validatedTracks.map((track: any) => ({
        url: track.url,
        name: track.name,
        isFavorite: track.isFavorite !== undefined ? track.isFavorite : false,
        playTime: track.playTime !== undefined ? track.playTime : 0,
        isPrebuilt: track.isPrebuilt !== undefined ? track.isPrebuilt : false
      }));
      
      return normalizedTracks;
    }
  } catch (error) {
    console.error("Error loading saved tracks:", error);
  }
  return [];
};

export const saveTracksToLocalStorage = (tracks: Track[]): void => {
  try {
    if (!tracks || !Array.isArray(tracks)) {
      console.error("Cannot save invalid tracks to localStorage:", tracks);
      return;
    }
    
    // Log before saving
    console.log("About to save tracks to localStorage:", tracks.length);
    if (tracks.length > 0) {
      console.log("First track to save:", tracks[0].name, "Is favorite:", tracks[0].isFavorite);
    }
    
    localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(tracks));
    
    // Verify the save worked
    const savedJson = localStorage.getItem(TRACKS_STORAGE_KEY);
    const savedTracks = savedJson ? JSON.parse(savedJson) : [];
    
    console.log("Tracks state updated and saved to localStorage:", 
                savedTracks.length, "tracks");
    
    if (savedTracks.length > 0) {
      console.log("First track saved:", savedTracks[0].name, 
                  "Is favorite:", savedTracks[0].isFavorite);
    }
  } catch (error) {
    console.error("Error saving tracks to localStorage:", error);
  }
};

// Function to check if localStorage is working properly
export const testLocalStorage = (): boolean => {
  try {
    const testKey = "test_storage";
    localStorage.setItem(testKey, "test");
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === "test";
  } catch (error) {
    console.error("LocalStorage is not available:", error);
    return false;
  }
};

// Helper to clear all tracks (for debugging/testing)
export const clearAllTracks = (): void => {
  try {
    localStorage.removeItem(TRACKS_STORAGE_KEY);
    console.log("All tracks cleared from localStorage");
  } catch (error) {
    console.error("Error clearing tracks:", error);
  }
};
