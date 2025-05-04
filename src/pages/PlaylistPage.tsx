
import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Playlist from "@/components/Playlist";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import MusicPlayer from "@/components/MusicPlayer";
import { useTrackStateContext } from "@/context/TrackStateContext";

const PlaylistPage: React.FC = () => {
  const { 
    tracks, 
    removeUrl, 
    editTrack, 
    currentIndex, 
    isPlaying, 
    setCurrentIndex, 
    setIsPlaying,
    debugState
  } = useTrackStateContext();
  
  // State to track if we need to re-render due to track changes
  const [tracksKey, setTracksKey] = useState(() => Date.now());
  
  // Use a callback to force re-render with the latest tracks
  const forceRefresh = useCallback(() => {
    console.log("Forcing playlist refresh");
    setTracksKey(Date.now());
  }, []);
  
  useEffect(() => {
    console.log("PlaylistPage - Current tracks count:", tracks.length);
    if (tracks.length > 0) {
      console.log("First track in playlist:", JSON.stringify(tracks[0]));
      console.log("All tracks in playlist:", JSON.stringify(tracks));
    }
    
    // CRITICAL FIX: Force a re-render when tracks change
    forceRefresh();
    
    // If debug function is available, use it for extended information
    if (debugState) {
      const debugInfo = debugState();
      console.log("PlaylistPage debug - state version:", debugInfo?.stateVersion);
    }
  }, [tracks, debugState, forceRefresh]);
  
  // Derive URLs from tracks
  const urls = tracks.map(track => track.url);
  
  const { toast } = useToast();

  const handleEditTrack = (index: number, data: { url: string; name: string }) => {
    console.log("Editing track at index:", index, "with data:", JSON.stringify(data));
    editTrack(index, data);
    toast({
      title: "Station updated",
      description: `"${data.name}" has been updated`,
    });
    forceRefresh();
  };

  const handlePlayTrack = (index: number) => {
    console.log("Selected track at index:", index);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleRemoveTrack = (index: number) => {
    console.log("Removing track at index:", index);
    removeUrl(index);
    
    toast({
      title: "Station removed",
      description: "The station has been removed from your playlist"
    });
    
    // Force a re-render
    forceRefresh();
  };

  return (
    <div className="min-h-screen p-3 md:p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-4 md:space-y-6 flex flex-col">
        <Navigation />
        
        <MusicPlayer
          urls={urls}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          tracks={tracks}
        />

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">My Stations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {/* Use key to force re-render when tracks change */}
            <Playlist
              key={tracksKey}
              urls={urls}
              tracks={tracks}
              currentIndex={currentIndex}
              onSelectTrack={handlePlayTrack}
              onRemoveTrack={handleRemoveTrack}
              onEditTrack={handleEditTrack}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaylistPage;
