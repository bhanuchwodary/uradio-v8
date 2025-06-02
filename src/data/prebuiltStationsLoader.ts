
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
    
    // Cache the stations in localStorage for offline use
    if (stations.length > 0) {
      localStorage.setItem('cached_prebuilt_stations', JSON.stringify(stations));
    }
    
    return stations;
  } catch (error) {
    console.error("Failed to load stations from Supabase, falling back to cached data");
    
    // Try to load from cache first
    const cachedStations = localStorage.getItem('cached_prebuilt_stations');
    if (cachedStations) {
      try {
        const parsedStations = JSON.parse(cachedStations);
        console.log(`Loaded ${parsedStations.length} cached stations from localStorage`);
        return parsedStations;
      } catch (parseError) {
        console.error("Failed to parse cached stations");
      }
    }
    
    // Final fallback to original localStorage mechanism
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
