
import { Track } from "@/types/track";

export interface TrackStateResult {
  // State
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  
  // Core actions
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  
  // Track operations (matching actual implementation)
  addUrl: (url: string, name?: string, isPrebuilt?: boolean, isFavorite?: boolean, language?: string) => { success: boolean, message: string };
  removeUrl: (index: number) => void;
  toggleFavorite: (index: number) => void;
  editTrack: (index: number, data: { url: string; name: string; language?: string }) => void;
  updatePlayTime: (index: number, seconds: number) => void;
  
  // Station operations (by value) - matching actual implementation
  editStationByValue: (station: Track, data: { url: string; name: string; language?: string }) => void;
  removeStationByValue: (station: Track) => void;
  
  // Station queries
  getUserStations: () => Track[];
  getTopStations: () => Track[];
  checkIfStationExists: (url: string) => Promise<{ exists: boolean; isUserStation: boolean; }>;
  
  // Debug functions (matching actual implementation)
  debugState: () => {
    tracksCount: number;
    isInitialized: boolean;
    localStorageWorking: boolean;
    stateVersion: number;
  };
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
