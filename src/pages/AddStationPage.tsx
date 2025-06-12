
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Radio } from "lucide-react";
import { useSimpleTrackState } from "@/hooks/useSimpleTrackState";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useToast } from "@/hooks/use-toast";
import { Track } from "@/types/track";

const AddStationPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stationUrl, setStationUrl] = useState("");
  const [stationName, setStationName] = useState("");
  const [stationLanguage, setStationLanguage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    tracks,
    currentIndex,
    isPlaying,
    addTrack
  } = useSimpleTrackState();

  const {
    volume,
    setVolume,
    handlePlayPause,
    handleNext,
    handlePrevious
  } = useMusicPlayer();

  const currentTrack = tracks[currentIndex] || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!stationUrl.trim()) {
        toast({
          title: "Error",
          description: "Please enter a station URL",
          variant: "destructive"
        });
        return;
      }

      // Check if station already exists
      const exists = tracks.some(track => track.url === stationUrl.trim());
      if (exists) {
        toast({
          title: "Station already exists",
          description: "This station is already in your collection",
          variant: "destructive"
        });
        return;
      }

      const newTrack: Omit<Track, 'playTime'> = {
        url: stationUrl.trim(),
        name: stationName.trim() || `Station ${tracks.length + 1}`,
        isFavorite: false,
        isFeatured: false,
        language: stationLanguage || "Unknown"
      };

      addTrack(newTrack);
      
      toast({
        title: "Success",
        description: "Station added successfully!"
      });

      // Reset form
      setStationUrl("");
      setStationName("");
      setStationLanguage("");
      
      // Navigate back to home after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add station. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Chinese",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Unknown"
  ];

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Add New Station</h1>
          <p className="text-muted-foreground">
            Add a new radio station to your collection
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Radio className="h-5 w-5 mr-2" />
              Station Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">Station URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/stream"
                  value={stationUrl}
                  onChange={(e) => setStationUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Station Name</Label>
                <Input
                  id="name"
                  placeholder="My Favorite Station"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={stationLanguage} onValueChange={setStationLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Station"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
};

export default AddStationPage;
