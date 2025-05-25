
import { fetchPrebuiltStations, adminManageStations } from "@/services/prebuiltStationsService";

/**
 * Get the current prebuilt stations from Supabase database
 */
export const getPrebuiltStations = async (): Promise<any[]> => {
  try {
    console.log("Fetching prebuilt stations from database");
    const stations = await fetchPrebuiltStations();
    console.log("Loaded prebuilt stations from database:", stations.length);
    return stations;
  } catch (error) {
    console.error("Failed to load prebuilt stations from database:", error);
    return [];
  }
};

/**
 * Save custom prebuilt stations to Supabase database
 */
export const savePrebuiltStations = async (
  stations: any[], 
  adminPassword: string,
  redirectToStationList: boolean = true
): Promise<boolean> => {
  try {
    console.log("Saving custom prebuilt stations to database:", stations.length);
    
    await adminManageStations('bulk-update', { stations }, adminPassword);
    
    console.log("Saved custom prebuilt stations to database:", stations.length);
    
    // Clear admin authentication state
    sessionStorage.removeItem("admin_authenticated");
    
    if (redirectToStationList) {
      window.location.href = "/station-list";
    } else {
      window.location.reload();
    }
    return true;
  } catch (error) {
    console.error("Failed to save custom prebuilt stations to database:", error);
    throw error;
  }
};

/**
 * Reset prebuilt stations to default (this would restore the original database entries)
 */
export const resetPrebuiltStations = async (
  adminPassword: string,
  redirectToStationList: boolean = true
): Promise<boolean> => {
  try {
    console.log("Resetting prebuilt stations to default");
    
    // For reset, we could implement a restore-defaults endpoint
    // For now, we'll just redirect and let the admin manually manage
    
    // Clear admin authentication state
    sessionStorage.removeItem("admin_authenticated");
    
    if (redirectToStationList) {
      window.location.href = "/station-list";
    } else {
      window.location.reload();
    }
    return true;
  } catch (error) {
    console.error("Failed to reset prebuilt stations:", error);
    throw error;
  }
};
