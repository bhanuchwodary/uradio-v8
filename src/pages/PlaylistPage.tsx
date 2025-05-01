
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Playlist from "@/components/Playlist";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import MusicPlayer from "@/components/MusicPlayer";
import { useTrackState } from "@/hooks/useTrackState";

interface PlaylistPageProps {
  currentIndex: number;
  isPlaying: boolean;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({
  currentIndex: appCurrentIndex,
  isPlaying: appIsPlaying,
  setCurrentIndex: appSetCurrentIndex,
  setIsPlaying: appSetIsPlaying
}) => {
  const { tracks, removeUrl, editTrack } = useTrackState();
  
  // Derive URLs from tracks
  const urls = tracks.map(track => track.url);
  
  const { toast } = useToast();

  const handleEditTrack = (index: number, data: { url: string; name: string }) => {
    editTrack(index, data);
    toast({
      title: "Station updated",
      description: `"${data.name}" has been updated`,
    });
  };

  return (
    <div className="min-h-screen p-3 md:p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-4 md:space-y-6 flex flex-col">
        <Navigation />
        
        <MusicPlayer
          urls={urls}
          currentIndex={appCurrentIndex}
          setCurrentIndex={appSetCurrentIndex}
          isPlaying={appIsPlaying}
          setIsPlaying={appSetIsPlaying}
          tracks={tracks}
        />

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">My Stations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <Playlist
              urls={urls}
              tracks={tracks}
              currentIndex={appCurrentIndex}
              onSelectTrack={(index) => {
                appSetCurrentIndex(index);
                appSetIsPlaying(true);
              }}
              onRemoveTrack={removeUrl}
              onEditTrack={handleEditTrack}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaylistPage;
