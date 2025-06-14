
import { Track } from "@/types/track";

export interface TrackStateResult {
  // Core state
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  
  // State setters
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  
  // Track operations
  addUrl: (
    url: string, 
    name?: string, 
    isFeatured?: boolean, 
    isFavorite?: boolean,
    language?: string,
    inPlaylist?: boolean,
    shouldAutoPlay?: boolean
  ) => { success: boolean; message: string; addedIndex?: number };
  removeUrl: (index: number) => void;
  toggleFavorite: (index: number) => void;
  toggleInPlaylist: (index: number) => void;
  clearAllFromPlaylist?: () => void; // NEW: Bulk clear function
  editTrack: (index: number, data: { url: string; name: string; language?: string }) => void;
  updatePlayTime: (index: number, seconds: number) => void;
  
  // Station operations by value
  editStationByValue: (station: Track, data: { url: string; name: string; language?: string }) => void;
  removeStationByValue: (station: Track) => void;
  
  // Utility functions
  checkIfStationExists: (url: string) => boolean;
  getUserStations: () => Track[];
  getTopStations: () => Track[];
  
  // Debug functions
  debugState?: () => void;
  logTracks?: () => void;
}
