
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
      return parsedTracks;
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
    
    localStorage.setItem(TRACKS_STORAGE_KEY, JSON.stringify(tracks));
    console.log("Tracks state updated and saved to localStorage:", tracks.length);
    if (tracks.length > 0) {
      console.log("First track saved:", tracks[0].name);
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
