
import { prebuiltStations as defaultPrebuiltStations } from "./prebuiltStations";
import { getPrebuiltStations } from "@/utils/prebuiltStationsManager";

// Export the stations (either custom or default)
export const getStations = (): any[] => {
  // Always fetch fresh data to ensure we have the latest changes
  const stations = getPrebuiltStations();
  console.log("Loaded stations:", stations.length);
  return stations;
};

// Export the default stations (for reference)
export const getDefaultStations = (): any[] => {
  return defaultPrebuiltStations;
};
