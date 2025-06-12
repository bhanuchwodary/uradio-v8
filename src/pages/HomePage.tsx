
import React, { useState } from "react";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { StationCard } from "@/components/ui/StationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useSimpleTrackState } from "@/hooks/useSimpleTrackState";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useToast } from "@/hooks/use-toast";
import { Track } from "@/types/track";

const HomePage: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newStationUrl, setNewStationUrl] = useState("");
  const [newStationName, setNewStationName] = useState("");
  
  const {
    tracks,
    currentIndex,
    isPlaying,
    addTrack,
    removeTrack,
    updateTrack,
    setCurrentIndex,
    setIsPlaying,
    clearAllTracks
  } = useSimpleTrackState();

  const {
    volume,
    setVolume,
    handlePlayPause,
    handleNext,
    handlePrevious
  } = useMusicPlayer();

  const currentTrack = tracks[currentIndex] || null;

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.language && track.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle adding new station
  const handleAddStation = () => {
    if (!newStationUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a station URL",
        variant: "destructive"
      });
      return;
    }

    const newTrack: Omit<Track, 'playTime'> = {
      url: newStationUrl.trim(),
      name: newStationName.trim() || `Station ${tracks.length + 1}`,
      isFavorite: false,
      isFeatured: false,
      language: "Unknown"
    };

    addTrack(newTrack);
    setNewStationUrl("");
    setNewStationName("");
    
    toast({
      title: "Success",
      description: "Station added successfully!"
    });
  };

  // Handle playing a station
  const handlePlayStation = (index: number) => {
    if (index === currentIndex && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentIndex(index);
      setIsPlaying(true);
    }
  };

  // Handle toggling favorite
  const handleToggleFavorite = (index: number) => {
    const track = tracks[index];
    updateTrack(index, { isFavorite: !track.isFavorite });
  };

  // Handle deleting station
  const handleDeleteStation = (index: number) => {
    removeTrack(index);
    toast({
      title: "Station removed",
      description: "Station has been deleted successfully"
    });
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
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Streamify</h1>
          <p className="text-muted-foreground text-lg">
            Your personal radio station collection
          </p>
        </div>

        {/* Add Station Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Station
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Station URL"
                value={newStationUrl}
                onChange={(e) => setNewStationUrl(e.target.value)}
              />
              <Input
                placeholder="Station Name (optional)"
                value={newStationName}
                onChange={(e) => setNewStationName(e.target.value)}
              />
            </div>
            <Button onClick={handleAddStation} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Station
            </Button>
          </CardContent>
        </Card>

        {/* Search Section */}
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

        {/* Stations Grid */}
        {filteredTracks.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Your Stations ({filteredTracks.length})
              </h2>
              {tracks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllTracks}
                  className="text-destructive hover:text-destructive"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTracks.map((station, index) => {
                const originalIndex = tracks.findIndex(t => t.url === station.url);
                return (
                  <StationCard
                    key={station.url}
                    station={station}
                    isCurrentlyPlaying={originalIndex === currentIndex}
                    isPlaying={isPlaying}
                    onPlay={() => handlePlayStation(originalIndex)}
                    onToggleFavorite={() => handleToggleFavorite(originalIndex)}
                    onDelete={() => handleDeleteStation(originalIndex)}
                  />
                );
              })}
            </div>
          </div>
        ) : tracks.length > 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stations found matching your search</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stations added yet. Add your first station above!</p>
          </div>
        )}
      </div>
    </ModernLayout>
  );
};

export default HomePage;
