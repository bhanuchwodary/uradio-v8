
import { useCallback } from "react";
import { Track } from "@/types/track";
import { getUserStations as getUser, getTopStations as getTop } from "./trackUtils";
import { checkIfStationExists as checkExists } from "./trackUtils";

export const useTrackManagement = (
  tracks: Track[], 
  tracksRef?: React.MutableRefObject<Track[]>
) => {
  const getUserStations = useCallback(() => {
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    return getUser(currentTracks);
  }, [tracks, tracksRef]);

  const getTopStations = useCallback(() => {
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    return getTop(currentTracks);
  }, [tracks, tracksRef]);

  const checkIfStationExists = useCallback((url: string) => {
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    return checkExists(url, currentTracks);
  }, [tracks, tracksRef]);

  return {
    getUserStations,
    getTopStations,
    checkIfStationExists
  };
};
