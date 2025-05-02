
import { Track } from "@/types/track";

export const loadTracksFromLocalStorage = (): Track[] => {
  try {
    const savedTracks = localStorage.getItem('musicTracks');
    if (savedTracks) {
      const parsedTracks = JSON.parse(savedTracks);
      console.log("Loaded tracks from localStorage:", parsedTracks);
      return parsedTracks;
    }
  } catch (error) {
    console.error("Error loading saved tracks:", error);
  }
  return [];
};

export const saveTracksToLocalStorage = (tracks: Track[]): void => {
  try {
    localStorage.setItem('musicTracks', JSON.stringify(tracks));
    console.log("Tracks state updated and saved to localStorage:", tracks);
  } catch (error) {
    console.error("Error saving tracks to localStorage:", error);
  }
};
