
import { fetchPrebuiltStations } from "@/services/prebuiltStationsService";

/**
 * Get the current stations list from Supabase database
 */
export const getStations = async () => {
  console.log("Loading prebuilt stations from Supabase");
  try {
    const stations = await fetchPrebuiltStations();
    console.log(`Loaded ${stations.length} stations from database`);
    return stations;
  } catch (error) {
    console.error("Failed to load stations from database:", error);
    // Return empty array as fallback
    return [];
  }
};
