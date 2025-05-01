
import React from "react";
import MusicPlayer from "@/components/MusicPlayer";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import Navigation from "@/components/Navigation";
import FavoriteStations from "@/components/FavoriteStations";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const {
    urls,
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
  } = useMusicPlayer();
  
  const isMobile = useIsMobile();
  const favoriteStations = tracks.filter(track => track.isFavorite);

  // Sleek Player Card Shadow, transparent, borders removed
  return (
    <div className="min-h-screen w-full p-3 md:p-6 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="container mx-auto max-w-5xl space-y-5">

        <Navigation />

        {/* Repositioned and Sleek Music Player */}
        <div className="flex flex-col gap-3">
          <div className="mb-2">
            <MusicPlayer
              urls={urls}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              tracks={tracks}
            />
          </div>

          {/* Favorite Stations section now comes after player */}
          {favoriteStations.length > 0 && (
            <FavoriteStations 
              stations={favoriteStations}
              onSelectStation={(index) => {
                const mainIndex = tracks.findIndex(t => t.url === favoriteStations[index].url);
                if (mainIndex !== -1) {
                  setCurrentIndex(mainIndex);
                  setIsPlaying(true);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
