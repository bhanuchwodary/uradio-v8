
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Playlist from "@/components/Playlist";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import MusicPlayer from "@/components/MusicPlayer";

const PlaylistPage = () => {
  const {
    urls,
    tracks,
    currentIndex,
    isPlaying,
    removeUrl,
    toggleFavorite,
    editTrack,
    setCurrentIndex,
    setIsPlaying,
  } = useMusicPlayer();
  
  const { toast } = useToast();

  const handleToggleFavorite = (index: number) => {
    toggleFavorite(index);
    const track = tracks[index];
    toast({
      title: track.isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `"${track.name}" ${track.isFavorite ? "removed from" : "added to"} favorites`,
    });
  };

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
          tracks={tracks}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">Playlist</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <Playlist
              urls={urls}
              tracks={tracks}
              currentIndex={currentIndex}
              onSelectTrack={(index) => {
                setCurrentIndex(index);
                setIsPlaying(true);
              }}
              onRemoveTrack={removeUrl}
              onToggleFavorite={handleToggleFavorite}
              onEditTrack={handleEditTrack}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaylistPage;
