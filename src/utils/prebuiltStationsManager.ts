
import { prebuiltStations as defaultPrebuiltStations } from "@/data/prebuiltStations";

// Storage key for the prebuilt stations
const CUSTOM_PREBUILT_STATIONS_KEY = "streamify_custom_prebuilt_stations";

/**
 * Get the current prebuilt stations (from localStorage if available, otherwise from default)
 */
export const getPrebuiltStations = (): any[] => {
  try {
    const customStations = localStorage.getItem(CUSTOM_PREBUILT_STATIONS_KEY);
    if (customStations) {
      const parsedStations = JSON.parse(customStations);
      // Validate the data to ensure it's an array
      if (Array.isArray(parsedStations)) {
        console.log("Loaded custom prebuilt stations:", parsedStations.length);
        return parsedStations;
      } else {
        console.error("Custom prebuilt stations is not an array");
        return defaultPrebuiltStations;
      }
    }
  } catch (error) {
    console.error("Failed to load custom prebuilt stations:", error);
    // If there's an error, remove the corrupted data
    localStorage.removeItem(CUSTOM_PREBUILT_STATIONS_KEY);
  }
  
  return defaultPrebuiltStations;
};

/**
 * Save custom prebuilt stations to localStorage
 */
export const savePrebuiltStations = (stations: any[]): boolean => {
  try {
    // Force reload any cached stations data
    localStorage.setItem(CUSTOM_PREBUILT_STATIONS_KEY, JSON.stringify(stations));
    console.log("Saved custom prebuilt stations:", stations.length);
    
    // Force a page reload to update all components that might be using the stations
    // This ensures changes are immediately visible throughout the app
    window.location.reload();
    return true;
  } catch (error) {
    console.error("Failed to save custom prebuilt stations:", error);
    return false;
  }
};

/**
 * Reset prebuilt stations to default
 */
export const resetPrebuiltStations = (): boolean => {
  try {
    localStorage.removeItem(CUSTOM_PREBUILT_STATIONS_KEY);
    console.log("Reset prebuilt stations to default");
    
    // Force a page reload to update all components
    window.location.reload();
    return true;
  } catch (error) {
    console.error("Failed to reset prebuilt stations:", error);
    return false;
  }
};
