
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useTrackState } from '@/hooks/useTrackState';
import { TrackStateResult } from '@/hooks/track-state/types';
import { Track } from '@/types/track';

// Create the context with a default value
const TrackStateContext = createContext<TrackStateResult | undefined>(undefined);

// Create a provider component
export const TrackStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trackState = useTrackState();
  const [initialized, setInitialized] = useState(false);
  const renderCount = useRef(0);
  
  // Enhanced logging to track state changes across renders
  useEffect(() => {
    renderCount.current++;
    console.log(`TrackStateProvider rendered ${renderCount.current} times`);
    console.log("TrackStateProvider - Current tracks count:", trackState.tracks.length);
    
    if (trackState.tracks.length > 0) {
      console.log("First track in context provider:", JSON.stringify(trackState.tracks[0]));
      console.log("All tracks in provider:", JSON.stringify(trackState.tracks));
    }
    
    // Mark as initialized after first render
    if (!initialized && trackState.tracks.length >= 0) {
      setInitialized(true);
      console.log("TrackState provider initialized");
    }
  }, [trackState.tracks, initialized]);
  
  // CRITICAL FIX: Memoize the context value to prevent unnecessary re-renders
  // but make sure we update when important state values change
  const contextValue = React.useMemo(() => trackState, [
    trackState.tracks,
    trackState.currentIndex,
    trackState.isPlaying
  ]);
  
  return (
    <TrackStateContext.Provider value={contextValue}>
      {children}
    </TrackStateContext.Provider>
  );
};

// Custom hook to use the track state context
export const useTrackStateContext = (): TrackStateResult => {
  const context = useContext(TrackStateContext);
  if (context === undefined) {
    throw new Error('useTrackStateContext must be used within a TrackStateProvider');
  }
  return context;
};
