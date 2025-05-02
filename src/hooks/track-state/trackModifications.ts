
import { Track } from "@/types/track";
import { checkIfStationExists } from "./trackUtils";

export const addStationUrl = (
  url: string, 
  name: string = "", 
  isPrebuilt: boolean = false, 
  isFavorite: boolean = false, 
  tracks: Track[]
): { tracks: Track[], result: { success: boolean, message: string } } => {
  if (!url) {
    console.error("Cannot add empty URL");
    return { tracks, result: { success: false, message: "URL cannot be empty" } };
  }
  
  console.log(`Adding URL: ${url}, Name: ${name}, IsPrebuilt: ${isPrebuilt}, isFavorite: ${isFavorite}`);
  
  // First, check for duplicates by URL in current playlist (case insensitive comparison for robustness)
  const existingIndex = tracks.findIndex(
    track => track.url.toLowerCase() === url.toLowerCase()
  );
  
  console.log("Checking for existing track in playlist with URL:", url);
  console.log("Existing track index:", existingIndex);
  
  if (existingIndex !== -1) {
    // If found, create a new array and update the existing station
    console.log("Station already exists in playlist, updating at index:", existingIndex);
    console.log("Current station favorite status:", tracks[existingIndex].isFavorite);
    
    const updatedTracks = [...tracks];
    // CRITICAL FIX: Only update specific properties, NEVER change isFavorite unless explicitly provided
    updatedTracks[existingIndex] = {
      ...updatedTracks[existingIndex],  // Keep all existing properties first
      url: url,  // Then update what we need to update
      name: name || updatedTracks[existingIndex].name,
      isPrebuilt: isPrebuilt !== undefined ? isPrebuilt : updatedTracks[existingIndex].isPrebuilt,
      // ONLY update isFavorite if it's explicitly provided
      isFavorite: isFavorite !== undefined ? isFavorite : updatedTracks[existingIndex].isFavorite
    };
    
    console.log("Updated track with favorite status:", updatedTracks[existingIndex].isFavorite);
    return { 
      tracks: updatedTracks, 
      result: { success: true, message: "Station updated in playlist" } 
    };
  } else {
    // If not found, add as a new station
    console.log("Station doesn't exist in playlist, adding as new");
    const newTrack: Track = { 
      url, 
      name: name || `Station ${tracks.length + 1}`,
      isFavorite: isFavorite,
      playTime: 0,
      isPrebuilt: isPrebuilt
    };
    console.log("New track being added:", newTrack);
    
    // Critical fix: create a fresh array to ensure state change detection
    const newTracks = [...tracks, newTrack];
    console.log("Updated tracks array now has", newTracks.length, "tracks");
    
    return { 
      tracks: newTracks, 
      result: { success: true, message: "Station added to playlist" } 
    };
  }
};

export const updateTrackPlayTime = (
  tracks: Track[], 
  index: number, 
  seconds: number
): Track[] => {
  const newTracks = [...tracks];
  if (newTracks[index]) {
    newTracks[index] = {
      ...newTracks[index],
      playTime: (newTracks[index].playTime || 0) + seconds
    };
  }
  return newTracks;
};

export const editTrackInfo = (
  tracks: Track[], 
  index: number, 
  data: { url: string; name: string }
): Track[] => {
  const newTracks = [...tracks];
  if (newTracks[index]) {
    newTracks[index] = {
      ...newTracks[index],
      url: data.url,
      name: data.name || `Station ${index + 1}`
    };
  }
  return newTracks;
};

export const editStationByValue = (
  tracks: Track[], 
  station: Track, 
  data: { url: string; name: string }
): Track[] => {
  const index = tracks.findIndex(
    track => track.url === station.url && track.name === station.name
  );
  
  if (index !== -1) {
    const newTracks = [...tracks];
    newTracks[index] = {
      ...newTracks[index],
      url: data.url,
      name: data.name
    };
    return newTracks;
  }
  
  return tracks;
};

export const removeStationByValue = (
  tracks: Track[], 
  station: Track
): Track[] => {
  const index = tracks.findIndex(
    track => track.url === station.url && track.name === station.name
  );
  
  if (index !== -1) {
    const newTracks = [...tracks];
    newTracks.splice(index, 1);
    return newTracks;
  }
  
  return tracks;
};

export const removeTrackByIndex = (
  tracks: Track[], 
  index: number, 
  currentIndex: number
): { tracks: Track[], newCurrentIndex: number, shouldStopPlaying: boolean } => {
  const newTracks = [...tracks];
  newTracks.splice(index, 1);
  
  let newCurrentIndex = currentIndex;
  let shouldStopPlaying = false;
  
  if (index === currentIndex) {
    if (newTracks.length > 0) {
      newCurrentIndex = Math.min(currentIndex, newTracks.length - 1);
    } else {
      newCurrentIndex = 0;
      shouldStopPlaying = true;
    }
  } else if (index < currentIndex) {
    newCurrentIndex = currentIndex - 1;
  }
  
  return { tracks: newTracks, newCurrentIndex, shouldStopPlaying };
};

export const toggleTrackFavorite = (
  tracks: Track[], 
  index: number
): Track[] => {
  const newTracks = [...tracks];
  if (newTracks[index]) {
    const newFavoriteStatus = !newTracks[index].isFavorite;
    newTracks[index] = {
      ...newTracks[index],
      isFavorite: newFavoriteStatus
    };
    console.log(`Toggled favorite status for station at index ${index} to ${newFavoriteStatus}`);
    console.log("Updated tracks array:", newTracks);
  }
  return newTracks;
};
