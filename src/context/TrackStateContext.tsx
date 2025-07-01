
import React, { createContext, useContext, ReactNode } from "react";
import { useTrackState } from "@/hooks/useTrackState";
import { TrackStateResult } from "@/hooks/track-state/types";

interface TrackStateContextProps extends TrackStateResult {}

const TrackStateContext = createContext<TrackStateContextProps | undefined>(undefined);

export const TrackStateProvider: React.FC<{ 
  children: ReactNode;
  playlistContext?: {
    removeFromPlaylist: (trackUrl: string) => boolean;
  };
}> = ({ children, playlistContext }) => {
  const trackState = useTrackState(playlistContext);

  return (
    <TrackStateContext.Provider value={trackState}>
      {children}
    </TrackStateContext.Provider>
  );
};

export const useTrackStateContext = (): TrackStateContextProps => {
  const context = useContext(TrackStateContext);
  if (!context) {
    throw new Error("useTrackStateContext must be used within a TrackStateProvider");
  }
  return context;
};
