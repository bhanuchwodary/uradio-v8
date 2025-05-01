
import { useState, useEffect } from "react";
import { Track } from "@/types/track";
import { TrackStateResult } from "./track-state/types";
import { 
  getUserStations, 
  getTopStations,
  checkIfStationExists as checkExists
} from "./track-state/trackUtils";
import { 
  addStationUrl, 
  updateTrackPlayTime, 
  editTrackInfo,
  editStationByValue as editByValue,
  removeStationByValue as removeByValue,
  removeTrackByIndex,
  toggleTrackFavorite
} from "./track-state/trackModifications";
import {
  loadTracksFromLocalStorage,
  saveTracksToLocalStorage
} from "./track-state/trackStorage";

export const useTrackState = (): TrackStateResult => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load tracks from localStorage on initial render
  useEffect(() => {
    setTracks(loadTracksFromLocalStorage());
  }, []);

  // Save tracks to localStorage whenever they change
  useEffect(() => {
    saveTracksToLocalStorage(tracks);
  }, [tracks]);

  const checkIfStationExists = (url: string) => {
    return checkExists(url, tracks);
  };

  const addUrl = (url: string, name: string = "", isPrebuilt: boolean = false, isFavorite?: boolean) => {
    const { tracks: updatedTracks, result } = addStationUrl(url, name, isPrebuilt, isFavorite, tracks);
    setTracks(updatedTracks);
    return result;
  };

  const updatePlayTime = (index: number, seconds: number) => {
    setTracks(currentTracks => updateTrackPlayTime(currentTracks, index, seconds));
  };

  const editTrack = (index: number, data: { url: string; name: string }) => {
    setTracks(currentTracks => editTrackInfo(currentTracks, index, data));
  };
  
  const editStationByValue = (station: Track, data: { url: string; name: string }) => {
    setTracks(currentTracks => editByValue(currentTracks, station, data));
  };
  
  const removeStationByValue = (station: Track) => {
    setTracks(currentTracks => removeByValue(currentTracks, station));
  };

  const removeUrl = (index: number) => {
    const { tracks: updatedTracks, newCurrentIndex, shouldStopPlaying } = 
      removeTrackByIndex(tracks, index, currentIndex);
    
    setTracks(updatedTracks);
    setCurrentIndex(newCurrentIndex);
    
    if (shouldStopPlaying) {
      setIsPlaying(false);
    }
  };

  const toggleFavorite = (index: number) => {
    setTracks(currentTracks => toggleTrackFavorite(currentTracks, index));
  };

  return {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
    updatePlayTime,
    getTopStations: () => getTopStations(tracks),
    getUserStations: () => getUserStations(tracks),
    checkIfStationExists,
    editStationByValue,
    removeStationByValue
  };
};
