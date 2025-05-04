
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";

const Index: React.FC = () => {
  const { 
    tracks, 
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying,
    toggleFavorite
  } = useTrackStateContext();
  
  // Get favorite and popular stations
  const favoriteStations = tracks.filter(track => track.isFavorite);
  
  // Calculate popular stations based on play time
  const popularStations = [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);
  
  // Derive URLs from tracks
  const urls = tracks.map(track => track.url);
  
  // Use player core for player functionality
  const {
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
  } = usePlayerCore({
    urls,
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });
  
  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;

  // Handle selecting a station from any list
  const handleSelectStation = (stationIndex: number, stationList: typeof tracks) => {
    // Find the corresponding index in the full tracks list
    const mainIndex = tracks.findIndex(t => t.url === stationList[stationIndex].url);
    if (mainIndex !== -1) {
      setCurrentIndex(mainIndex);
      setIsPlaying(true);
    }
  };
  
  // Toggle favorite for any station
  const handleToggleFavorite = (station: typeof tracks[0]) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index !== -1) {
      toggleFavorite(index);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Player Card */}
        <div className="mb-6">
          <MusicPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            volume={volume}
            onVolumeChange={setVolume}
            loading={loading}
          />
        </div>

        {/* Favorites Section */}
        {favoriteStations.length > 0 && (
          <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <StationGrid
                stations={favoriteStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => handleSelectStation(index, favoriteStations)}
                onToggleFavorite={handleToggleFavorite}
              />
            </CardContent>
          </Card>
        )}

        {/* Popular Stations */}
        <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Popular Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <StationGrid
              stations={popularStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrack?.url}
              isPlaying={isPlaying}
              onSelectStation={(index) => handleSelectStation(index, popularStations)}
              onToggleFavorite={handleToggleFavorite}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
