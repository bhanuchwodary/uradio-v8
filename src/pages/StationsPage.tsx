
import React, { useState } from "react";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { StationCard } from "@/components/ui/StationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Radio, Search, Star } from "lucide-react";
import { useSimpleTrackState } from "@/hooks/useSimpleTrackState";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";

const StationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    tracks,
    currentIndex,
    isPlaying,
    updateTrack,
    setCurrentIndex,
    setIsPlaying
  } = useSimpleTrackState();

  const {
    volume,
    setVolume,
    handlePlayPause,
    handleNext,
    handlePrevious
  } = useMusicPlayer();

  const currentTrack = tracks[currentIndex] || null;

  // Filter and categorize stations
  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.language && track.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const favoriteStations = filteredTracks.filter(track => track.isFavorite);
  const recentStations = [...filteredTracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);

  // Group by language
  const stationsByLanguage = filteredTracks.reduce((acc, station) => {
    const language = station.language || "Unknown";
    if (!acc[language]) acc[language] = [];
    acc[language].push(station);
    return acc;
  }, {} as Record<string, typeof filteredTracks>);

  // Handle playing a station
  const handlePlayStation = (station: any) => {
    const index = tracks.findIndex(t => t.url === station.url);
    if (index === currentIndex && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  // Handle toggling favorite
  const handleToggleFavorite = (station: any) => {
    const index = tracks.findIndex(t => t.url === station.url);
    updateTrack(index, { isFavorite: !station.isFavorite });
  };

  return (
    <ModernLayout
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      volume={volume}
      onVolumeChange={setVolume}
      onPlayPause={handlePlayPause}
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Stations</h1>
        </div>

        {/* Search */}
        {tracks.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {tracks.length > 0 ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Stations</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="language">By Language</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTracks.map((station) => (
                  <StationCard
                    key={station.url}
                    station={station}
                    isCurrentlyPlaying={tracks[currentIndex]?.url === station.url}
                    isPlaying={isPlaying}
                    onPlay={() => handlePlayStation(station)}
                    onToggleFavorite={() => handleToggleFavorite(station)}
                    showControls={false}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-6">
              {favoriteStations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favoriteStations.map((station) => (
                    <StationCard
                      key={station.url}
                      station={station}
                      isCurrentlyPlaying={tracks[currentIndex]?.url === station.url}
                      isPlaying={isPlaying}
                      onPlay={() => handlePlayStation(station)}
                      onToggleFavorite={() => handleToggleFavorite(station)}
                      showControls={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No favorite stations yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              {recentStations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recentStations.map((station) => (
                    <StationCard
                      key={station.url}
                      station={station}
                      isCurrentlyPlaying={tracks[currentIndex]?.url === station.url}
                      isPlaying={isPlaying}
                      onPlay={() => handlePlayStation(station)}
                      onToggleFavorite={() => handleToggleFavorite(station)}
                      showControls={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent stations</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="language" className="space-y-6">
              {Object.entries(stationsByLanguage).map(([language, stations]) => (
                <Card key={language}>
                  <CardHeader>
                    <CardTitle>{language} Stations ({stations.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {stations.map((station) => (
                        <StationCard
                          key={station.url}
                          station={station}
                          isCurrentlyPlaying={tracks[currentIndex]?.url === station.url}
                          isPlaying={isPlaying}
                          onPlay={() => handlePlayStation(station)}
                          onToggleFavorite={() => handleToggleFavorite(station)}
                          showControls={false}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stations added yet</p>
          </div>
        )}
      </div>
    </ModernLayout>
  );
};

export default StationsPage;
