
import { Track } from "@/types/track";

const STORAGE_KEY = 'uradio-tracks';

export const testLocalStorage = (): boolean => {
  try {
    const testKey = 'test-storage';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
};

export const saveTracksToLocalStorage = (tracks: Track[]): boolean => {
  try {
    const tracksJson = JSON.stringify(tracks);
    localStorage.setItem(STORAGE_KEY, tracksJson);
    console.log(`Saved ${tracks.length} tracks to localStorage`);
    return true;
  } catch (error) {
    console.error('Failed to save tracks to localStorage:', error);
    return false;
  }
};

export const loadTracksFromLocalStorage = (): Track[] => {
  try {
    console.log('Loading tracks from localStorage...');
    const tracksJson = localStorage.getItem(STORAGE_KEY);
    
    if (!tracksJson) {
      console.log('No saved tracks found in localStorage');
      return [];
    }
    
    const tracks = JSON.parse(tracksJson) as Track[];
    
    // Validate the loaded tracks structure
    if (!Array.isArray(tracks)) {
      console.warn('Invalid tracks data structure, resetting to empty array');
      return [];
    }
    
    // Validate each track has required properties
    const validTracks = tracks.filter(track => 
      track && 
      typeof track.url === 'string' && 
      typeof track.name === 'string'
    );
    
    if (validTracks.length !== tracks.length) {
      console.warn(`Filtered out ${tracks.length - validTracks.length} invalid tracks`);
    }
    
    console.log(`Loaded ${validTracks.length} tracks from localStorage`);
    return validTracks;
  } catch (error) {
    console.error('Failed to load tracks from localStorage:', error);
    return [];
  }
};

export const clearTracksFromLocalStorage = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared tracks from localStorage');
    return true;
  } catch (error) {
    console.error('Failed to clear tracks from localStorage:', error);
    return false;
  }
};

// Simplified sync verification that doesn't cause loops
export const verifySyncStatus = (currentTracks: Track[]): boolean => {
  try {
    const storedTracksJson = localStorage.getItem(STORAGE_KEY);
    const currentTracksJson = JSON.stringify(currentTracks);
    
    // If no storage data and no current tracks, they're in sync
    if (!storedTracksJson && currentTracks.length === 0) {
      return true;
    }
    
    // If no storage data but we have current tracks, not in sync
    if (!storedTracksJson && currentTracks.length > 0) {
      return false;
    }
    
    // If storage data exists, compare JSON strings
    return storedTracksJson === currentTracksJson;
  } catch (error) {
    console.error('Error verifying sync status:', error);
    return false; // Assume not in sync if we can't verify
  }
};
