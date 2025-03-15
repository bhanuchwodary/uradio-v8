
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MusicPlayer from "@/components/MusicPlayer";
import AddUrlForm from "@/components/AddUrlForm";
import Playlist from "@/components/Playlist";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const {
    urls,
    tracks,
    currentIndex,
    isPlaying,
    addUrl,
    removeUrl,
    toggleFavorite,
    editTrack,
    setCurrentIndex,
    setIsPlaying,
  } = useMusicPlayer();
  
  const { toast } = useToast();

  const handleAddUrl = (url: string, name: string) => {
    addUrl(url, name);
    toast({
      title: "Station added",
      description: `"${name}" has been added to the playlist`,
    });
  };

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
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Streamify Jukebox
          </h1>
          <ThemeToggle />
        </div>

        <MusicPlayer
          urls={urls}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Add Station</CardTitle>
          </CardHeader>
          <CardContent>
            <AddUrlForm onAddUrl={handleAddUrl} />
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Playlist</CardTitle>
          </CardHeader>
          <CardContent>
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

export default Index;
