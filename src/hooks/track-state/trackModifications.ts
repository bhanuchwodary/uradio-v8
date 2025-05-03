
import { Track } from "@/types/track";

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
  
  console.log(`Adding URL: ${url}, Name: ${name}, IsPrebuilt: ${isPrebuilt}, IsFavorite: ${isFavorite}`);
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
    console.log("Current station data:", JSON.stringify(tracksClone[existingIndex]));
    
    // Create a completely new array to ensure React detects the state change
    updatedTracks = [...tracksClone];
    
    // Update all properties explicitly
    updatedTracks[existingIndex] = {
      ...updatedTracks[existingIndex],  // Keep existing properties first
      url: url,  // Then update what we need to update
      name: name || updatedTracks[existingIndex].name,
      isPrebuilt: isPrebuilt !== undefined ? isPrebuilt : updatedTracks[existingIndex].isPrebuilt,
      isFavorite: isFavorite !== undefined ? isFavorite : updatedTracks[existingIndex].isFavorite,
      playTime: updatedTracks[existingIndex].playTime || 0
    };
    
    console.log("Updated station data:", JSON.stringify(updatedTracks[existingIndex]));
    resultMessage = "Station updated in playlist";
  } else {
    // If not found, add as a new station
    console.log("Station doesn't exist in playlist, adding as new");
    const newTrack: Track = { 
      url, 
      name: name || `Station ${tracksClone.length + 1}`,
      isFavorite: !!isFavorite,
      playTime: 0,
      isPrebuilt: !!isPrebuilt
    };
    
    console.log("New track being added:", JSON.stringify(newTrack));
    
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

export const removeTrackByIndex = (
  tracks: Track[], 
  index: number, 
  currentIndex: number
): { tracks: Track[], newCurrentIndex: number, shouldStopPlaying: boolean } => {
  // Create a new array to ensure state updates are detected
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

export const editTrackInfo = (
  tracks: Track[], 
  index: number, 
  data: { url: string; name: string }
): Track[] => {
  // Create a new array to ensure state updates are detected
  const newTracks = JSON.parse(JSON.stringify(tracks));
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
    // Create a new array to ensure state updates are detected
    const newTracks = JSON.parse(JSON.stringify(tracks));
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
    // Create a new array to ensure state updates are detected
    const newTracks = [...tracks];
    newTracks.splice(index, 1);
    return newTracks;
  }
  
  return tracks;
};

export const toggleTrackFavorite = (
  tracks: Track[], 
  index: number
): Track[] => {
  // Create a new array to ensure state updates are detected
  const newTracks = JSON.parse(JSON.stringify(tracks));
  if (newTracks[index]) {
    const newFavoriteStatus = !newTracks[index].isFavorite;
    newTracks[index] = {
      ...newTracks[index],
      isFavorite: newFavoriteStatus
    };
    console.log(`Toggled favorite status for station at index ${index} to ${newFavoriteStatus}`);
  }
  return newTracks;
};

export const updateTrackPlayTime = (
  tracks: Track[], 
  index: number, 
  seconds: number
): Track[] => {
  // Create a new array to ensure state updates are detected
  const newTracks = JSON.parse(JSON.stringify(tracks));
  if (newTracks[index]) {
    newTracks[index] = {
      ...newTracks[index],
      playTime: (newTracks[index].playTime || 0) + seconds
    };
  }
  return newTracks;
};
