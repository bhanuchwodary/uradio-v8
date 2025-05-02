
import { Track } from "@/types/track";

// Storage key for consistency
const TRACKS_STORAGE_KEY = 'musicTracks';

export const loadTracksFromLocalStorage = (): Track[] => {
  try {
    const savedTracks = localStorage.getItem(TRACKS_STORAGE_KEY);
    if (savedTracks) {
      const parsedTracks = JSON.parse(savedTracks);
      console.log("Loaded tracks from localStorage:", parsedTracks.length);
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
  } catch (error) {
    console.error("Error saving tracks to localStorage:", error);
  }
};
