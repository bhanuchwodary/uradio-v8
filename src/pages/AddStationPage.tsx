
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddUrlForm from "@/components/AddUrlForm";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import MusicPlayer from "@/components/MusicPlayer";

const AddStationPage = () => {
  const {
    urls,
    addUrl,
    currentIndex,
    isPlaying,
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
        />

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">Add Station</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <AddUrlForm onAddUrl={handleAddUrl} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddStationPage;
