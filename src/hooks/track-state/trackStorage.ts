
import { Track } from "@/types/track";

export const loadTracksFromLocalStorage = (): Track[] => {
  const savedTracks = localStorage.getItem('musicTracks');
  if (savedTracks) {
    try {
      return JSON.parse(savedTracks);
    } catch (error) {
      console.error("Error loading saved tracks:", error);
      return [];
    }
  }
  return [];
};

export const saveTracksToLocalStorage = (tracks: Track[]): void => {
  localStorage.setItem('musicTracks', JSON.stringify(tracks));
  console.log("Tracks state updated and saved to localStorage:", tracks);
};
