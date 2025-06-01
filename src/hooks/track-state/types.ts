
import { Track } from "@/types/track";

export interface TrackStateResult {
  // State
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  
  // Core actions
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  
  // Track operations
  addStation: (url: string, name?: string) => Promise<boolean>;
  removeTrackByIndex: (index: number) => boolean;
  editTrackInfo: (index: number, newName: string, newUrl: string) => boolean;
  toggleTrackFavorite: (index: number) => boolean;
  updateTrackPlayTime: (index: number, playTime: number) => boolean;
  
  // Station operations (by value)
  editStationByValue: (oldUrl: string, newName: string, newUrl: string) => boolean;
  removeStationByValue: (url: string) => boolean;
  
  // Station queries
  getUserStations: () => Track[];
  getTopStations: () => Track[];
  checkIfStationExists: (url: string) => Promise<{ exists: boolean; isUserStation: boolean; }>; // Fixed: Made async
  
  // Debug functions
  logCurrentState: () => void;
  getDebugInfo: () => {
    tracksCount: number;
    currentTrack: Track | null;
    isPlaying: boolean;
    isInitialized: boolean;
    needsSaving: boolean;
    stateVersion: number;
  };
}
