
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MusicPlayer from "@/components/MusicPlayer";
import AddUrlForm from "@/components/AddUrlForm";
import Playlist from "@/components/Playlist";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const {
    urls,
    currentIndex,
    isPlaying,
    addUrl,
    removeUrl,
    setCurrentIndex,
    setIsPlaying,
  } = useMusicPlayer();
  
  const { toast } = useToast();

  const handleAddUrl = (url: string) => {
    addUrl(url);
    toast({
      title: "Track added",
      description: "New track has been added to the playlist",
    });
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Music Streaming App
        </h1>

        <MusicPlayer
          urls={urls}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Add Music URL</CardTitle>
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
              currentIndex={currentIndex}
              onSelectTrack={(index) => {
                setCurrentIndex(index);
                setIsPlaying(true);
              }}
              onRemoveTrack={removeUrl}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
