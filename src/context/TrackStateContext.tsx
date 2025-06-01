
import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react';
import { useTrackState } from '@/hooks/useTrackState';
import { TrackStateResult } from '@/hooks/track-state/types';

// Create the context with a default value
const TrackStateContext = createContext<TrackStateResult | undefined>(undefined);

// Create a provider component
export const TrackStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trackState = useTrackState();
  const [initialized, setInitialized] = useState(false);
  const renderCount = useRef(0);
  
  // Enhanced logging to track state changes across renders, but only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current++;
      console.log(`TrackStateProvider rendered ${renderCount.current} times`);
      console.log("TrackStateProvider - Current tracks count:", trackState.tracks.length);
      
      if (trackState.tracks.length > 0) {
        console.log("First track in context provider:", JSON.stringify(trackState.tracks[0]));
      }
    }
    
    // Mark as initialized after first render
    if (!initialized && trackState.tracks.length >= 0) {
      setInitialized(true);
      if (process.env.NODE_ENV === 'development') {
        console.log("TrackState provider initialized");
      }
    }
  }, [trackState.tracks, initialized]);
  
  // Create a stable context value with more specific dependencies to avoid unnecessary rerenders
  const contextValue = useMemo(() => {
    return {
      ...trackState,
      // Force explicit equality checks for key properties
      tracks: trackState.tracks,
      currentIndex: trackState.currentIndex,
      isPlaying: trackState.isPlaying
    };
  }, [
    trackState.tracks,
    trackState.currentIndex,
    trackState.isPlaying,
    // Only add other dependencies that should trigger context updates
    trackState.getDebugInfo
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
