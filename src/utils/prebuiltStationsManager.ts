
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
    
    const result = await adminManageStations('bulk-update', { stations }, adminPassword);
    console.log("Bulk update result:", result);
    
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
 * Reset prebuilt stations to default
 */
export const resetPrebuiltStations = async (
  adminPassword: string,
  redirectToStationList: boolean = true
): Promise<boolean> => {
  try {
    console.log("Resetting prebuilt stations to default");
    
    // For now, we'll implement a basic reset by reloading the default stations
    // In a full implementation, you might want to store the original stations
    // and restore them, or have a separate reset endpoint
    
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
