
import { supabaseStationsService } from "@/services/supabaseStationsService";

/**
 * Get the current stations list from Supabase database.
 * Falls back to localStorage for offline functionality.
 */
export const getStations = async () => {
  console.log("Loading prebuilt stations from Supabase");
  
  try {
    const stations = await supabaseStationsService.getPrebuiltStations();
    console.log(`Loaded ${stations.length} stations from Supabase`);
    return stations;
  } catch (error) {
    console.error("Failed to load stations from Supabase, falling back to localStorage");
    
    // Fallback to localStorage for offline functionality
    const { getPrebuiltStations } = await import("@/utils/prebuiltStationsManager");
    const fallbackStations = getPrebuiltStations();
    console.log(`Loaded ${fallbackStations.length} fallback stations from localStorage`);
    
    // Convert to Track format
    return fallbackStations.map(station => ({
      ...station,
      isFavorite: false,
      isPrebuilt: true,
      playTime: 0
    }));
  }
};
