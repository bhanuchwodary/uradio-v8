
import { getPrebuiltStations } from "@/utils/prebuiltStationsManager";

/**
 * Get the current stations list - either from the prebuilt stations manager
 * (which checks localStorage first) or from the default prebuilt list.
 */
export const getStations = () => {
  console.log("Loading prebuilt stations");
  const stations = getPrebuiltStations();
  console.log(`Loaded ${stations.length} stations`);
  return stations;
};
