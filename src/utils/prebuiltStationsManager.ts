
import { prebuiltStations } from "@/data/prebuiltStations";

// Storage key for the prebuilt stations
const CUSTOM_PREBUILT_STATIONS_KEY = "streamify_custom_prebuilt_stations";

/**
 * Get the current prebuilt stations (from localStorage if available, otherwise from default)
 */
export const getPrebuiltStations = (): any[] => {
  try {
    const customStations = localStorage.getItem(CUSTOM_PREBUILT_STATIONS_KEY);
    if (customStations) {
      return JSON.parse(customStations);
    }
  } catch (error) {
    console.error("Failed to load custom prebuilt stations:", error);
  }
  
  return prebuiltStations;
};

/**
 * Save custom prebuilt stations to localStorage
 */
export const savePrebuiltStations = (stations: any[]): boolean => {
  try {
    localStorage.setItem(CUSTOM_PREBUILT_STATIONS_KEY, JSON.stringify(stations));
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
    return true;
  } catch (error) {
    console.error("Failed to reset prebuilt stations:", error);
    return false;
  }
};
