
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { getStations } from "@/data/featuredStationsLoader";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";
import { ListMusic, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const StationListPage: React.FC = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    tracks,
    currentIndex,
    isPlaying,
    addUrl,
    editStationByValue,
    removeStationByValue,
    getUserStations
  } = useTrackStateContext();

  // Get user stations
  const userStations = getUserStations();

  // Get featured stations from loader
  const featuredStationsList = getStations();

  // Create proper track objects from featured stations data
  const featuredStationTracks: Track[] = featuredStationsList.map(station => ({
    ...station,
    isFavorite: false,
    isFeatured: true,
    playTime: 0
  }));

  // Get current track
  const currentTrack = tracks[currentIndex];

  // Group featured stations by language
  const stationsByLanguage: Record<string, Track[]> = {};

  featuredStationTracks.forEach(station => {
    const language = station.language || "Unknown";
    if (!stationsByLanguage[language]) {
      stationsByLanguage[language] = [];
    }
    stationsByLanguage[language].push(station);
  });

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  const filteredUserStations = userStations.filter(station =>
    station.name.toLowerCase().includes(lowerCaseSearchTerm) ||
    station.language?.toLowerCase().includes(lowerCaseSearchTerm)
  );

  const filteredStationsByLanguage: Record<string, Track[]> = Object.entries(stationsByLanguage)
    .reduce((acc, [language, stations]) => {
      const filtered = stations.filter(station =>
        station.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        station.language?.toLowerCase().includes(lowerCaseSearchTerm)
      );
      if (filtered.length > 0) {
        acc[language] = filtered;
      }
      return acc;
    }, {} as Record<string, Track[]>);

  // Add station to playlist handler
  const handleAddStation = (station: Track) => {
    const result = addUrl(
      station.url,
      station.name,
      station.isFeatured || false,
      station.isFavorite || false,
      station.language || ""
    );

    if (result.success) {
      toast({
        title: "Station Added",
        description: `${station.name} has been added to your playlist`,
      });
    } else {
      toast({
        title: "Failed to Add Station",
        description: result.message || "Error adding station",
        variant: "destructive"
      });
    }
  };

  // Handle edit station
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };

  // Handle delete station
  const handleDeleteStation = (station: Track) => {
    removeStationByValue(station);
    toast({
      title: "Station removed",
      description: `${station.name} has been removed from your stations`
    });
  };

  // Save edited station
  const handleSaveEdit = (data: { url: string; name: string; language?: string }) => {
    if (editingStation) {
      editStationByValue(editingStation, data);
      toast({
        title: "Station updated",
        description: `${data.name} has been updated`
      });
      setEditingStation(null);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stations by name or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full bg-background/50 backdrop-blur-sm"
          />
        </div>

        {/* My Stations */}
        <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 elevation-2">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">My Stations</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {filteredUserStations.length > 0 ? (
              <StationGrid
                stations={filteredUserStations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => handleAddStation(filteredUserStations[index])}
                onEditStation={handleEditStation}
                onDeleteStation={handleDeleteStation}
                actionIcon="add"
              />
            ) : (
              searchTerm === '' && userStations.length === 0 && (
                <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50 flex flex-col items-center justify-center gap-4">
                  <ListMusic className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <p className="text-muted-foreground font-semibold">No stations added yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Add stations to build your collection</p>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Featured Stations */}
        {Object.entries(filteredStationsByLanguage).map(([language, stations]) => (
          <Card key={language} className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 elevation-2">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Featured {language} Stations</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <StationGrid
                stations={stations}
                currentIndex={currentIndex}
                currentTrackUrl={currentTrack?.url}
                isPlaying={isPlaying}
                onSelectStation={(index) => handleAddStation(stations[index])}
                actionIcon="add"
              />
            </CardContent>
          </Card>
        ))}

        {/* No results message */}
        {searchTerm && filteredUserStations.length === 0 && Object.keys(filteredStationsByLanguage).length === 0 && (
          <div className="text-center p-8 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50 flex flex-col items-center justify-center gap-4">
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-muted-foreground font-semibold">No stations found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term.</p>
            </div>
          </div>
        )}

        {/* Edit station dialog */}
        {editingStation && (
          <EditStationDialog
            isOpen={!!editingStation}
            onClose={() => setEditingStation(null)}
            onSave={handleSaveEdit}
            initialValues={{
              url: editingStation.url,
              name: editingStation.name,
              language: editingStation.language
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default StationListPage;
