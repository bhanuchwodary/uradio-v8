
import { prebuiltStations as defaultPrebuiltStations } from "./prebuiltStations";
import { getPrebuiltStations } from "@/utils/prebuiltStationsManager";

// Export the stations (either custom or default)
export const getStations = (): any[] => {
  return getPrebuiltStations();
};

// Export the default stations (for reference)
export const getDefaultStations = (): any[] => {
  return defaultPrebuiltStations;
};
