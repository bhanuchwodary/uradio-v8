
import { Track } from "@/types/track";

// Storage key for consistency
const TRACKS_STORAGE_KEY = 'musicTracks';
const STORAGE_VERSION = 'v2'; // Updated version for better stability

// Helper to create a structured storage format
const createStorageStructure = (tracks: Track[]) => ({
  version: STORAGE_VERSION,
  tracks,
  lastUpdated: new Date().toISOString()
});

export const loadTracksFromLocalStorage = (): Track[] => {
  try {
    console.log("Loading tracks from localStorage...");
    const savedTracks = localStorage.getItem(TRACKS_STORAGE_KEY);
    
    if (!savedTracks) {
      console.log("No saved tracks found in localStorage");
      return [];
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(savedTracks);
    } catch (parseError) {
      console.error("Failed to parse tracks from localStorage:", parseError);
      return [];
    }
    
    // Handle both legacy format (direct array) and new structured format
    const tracksArray = parsedData.tracks ? parsedData.tracks : parsedData;
    
    if (!Array.isArray(tracksArray)) {
      console.error("Loaded tracks is not an array:", tracksArray);
      return [];
    }
    
    console.log("Loaded tracks from localStorage:", tracksArray.length);
    
    // Deep clone to avoid reference issues
    const deepClonedTracks = JSON.parse(JSON.stringify(tracksArray));
    
    // Ensure all required properties are present and properly typed
    const validatedTracks = deepClonedTracks.filter((track: any) => {
      const isValid = track && 
                      typeof track.url === 'string' && 
                      typeof track.name === 'string';
      if (!isValid) {
        console.error("Invalid track found:", track);
      }
      return isValid;
    });
    
    // Fill in any missing optional properties with defaults
    const normalizedTracks = validatedTracks.map((track: any) => ({
      url: track.url,
      name: track.name,
      isFavorite: track.isFavorite !== undefined ? Boolean(track.isFavorite) : false,
      playTime: track.playTime !== undefined ? Number(track.playTime) : 0,
      isPrebuilt: track.isPrebuilt !== undefined ? Boolean(track.isPrebuilt) : false
    }));
    
    console.log("Normalized tracks:", normalizedTracks.length);
    if (normalizedTracks.length > 0) {
      console.log("Sample track:", JSON.stringify(normalizedTracks[0]));
    }
    
    return normalizedTracks;
  } catch (error) {
    console.error("Error loading saved tracks:", error);
    return [];
  }
};

export const saveTracksToLocalStorage = (tracks: Track[]): boolean => {
  try {
    if (!tracks || !Array.isArray(tracks)) {
      console.error("Cannot save invalid tracks to localStorage:", tracks);
      return false;
    }
    
    // Deep clone tracks to avoid reference issues
    const tracksToSave = JSON.parse(JSON.stringify(tracks));
    
    // Use the structured storage format
    const storageData = createStorageStructure(tracksToSave);
    
    // Log before saving
    console.log("About to save tracks to localStorage:", tracksToSave.length);
    if (tracksToSave.length > 0) {
      console.log("First track to save:", JSON.stringify(tracksToSave[0]));
    }
    
    localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(storageData));
    
    // Verify the save worked by attempting to read it back
    try {
      const savedJson = localStorage.getItem(TRACKS_STORAGE_KEY);
      if (!savedJson) {
        console.error("Failed to verify saved tracks - no data found");
        return false;
      }
      
      const parsedData = JSON.parse(savedJson);
      const savedTracks = parsedData.tracks || [];
      
      console.log("Tracks saved to localStorage:", savedTracks.length);
      
      if (savedTracks.length !== tracks.length) {
        console.warn("Track count mismatch after saving:", 
                    {original: tracks.length, saved: savedTracks.length});
        return false;
      }
      return true;
    } catch (verifyError) {
      console.error("Error verifying saved tracks:", verifyError);
      return false;
    }
  } catch (error) {
    console.error("Error saving tracks to localStorage:", error);
    return false;
  }
};

// Function to check if localStorage is working properly
export const testLocalStorage = (): boolean => {
  try {
    const testKey = "test_storage";
    localStorage.setItem(testKey, "test");
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    console.log("LocalStorage test result:", result === "test");
    return result === "test";
  } catch (error) {
    console.error("LocalStorage is not available:", error);
    return false;
  }
};

// Function to verify localStorage is synchronized with app state
export const verifySyncStatus = (tracks: Track[]): boolean => {
  try {
    const savedJson = localStorage.getItem(TRACKS_STORAGE_KEY);
    if (!savedJson) return false;
    
    const parsedData = JSON.parse(savedJson);
    const savedTracks = parsedData.tracks || parsedData;
    
    if (!Array.isArray(savedTracks)) return false;
    if (savedTracks.length !== tracks.length) return false;
    
    // Check if first few tracks match (URL and name should be good enough)
    for (let i = 0; i < Math.min(3, tracks.length); i++) {
      if (savedTracks[i].url !== tracks[i].url || savedTracks[i].name !== tracks[i].name) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error verifying sync status:", error);
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
