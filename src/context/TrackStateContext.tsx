
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTrackState } from '@/hooks/useTrackState';
import { TrackStateResult } from '@/hooks/track-state/types';
import { Track } from '@/types/track';

// Create the context with a default value
const TrackStateContext = createContext<TrackStateResult | undefined>(undefined);

// Create a provider component
export const TrackStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trackState = useTrackState();
  const [initialized, setInitialized] = useState(false);
  
  // Enhanced logging to track state changes across renders
  useEffect(() => {
    console.log("TrackStateProvider - Current tracks count:", trackState.tracks.length);
    if (trackState.tracks.length > 0) {
      console.log("First track in context provider:", JSON.stringify(trackState.tracks[0]));
    }
    
    // Mark as initialized after first render
    if (!initialized && trackState.tracks.length >= 0) {
      setInitialized(true);
    }
  }, [trackState.tracks, initialized]);
  
  return (
    <TrackStateContext.Provider value={trackState}>
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
