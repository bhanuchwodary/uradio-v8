
import { useCallback } from "react";
import { Track } from "@/types/track";
import { getUserStations as getUser, getTopStations as getTop } from "./trackUtils";
import { checkIfStationExists as checkExists } from "./trackUtils";

export const useTrackManagement = (tracks: Track[]) => {
  const getUserStations = useCallback(() => {
    return getUser(tracks);
  }, [tracks]);

  const getTopStations = useCallback(() => {
    return getTop(tracks);
  }, [tracks]);

  const checkIfStationExists = useCallback((url: string) => {
    return checkExists(url, tracks);
  }, [tracks]);

  return {
    getUserStations,
    getTopStations,
    checkIfStationExists
  };
};
