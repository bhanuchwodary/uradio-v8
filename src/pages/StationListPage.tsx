
import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { getStations } from "@/data/featuredStationsLoader";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";
import StationSearch from "@/components/station-list/StationSearch";
import UserStations from "@/components/station-list/UserStations";
import FeaturedStations from "@/components/station-list/FeaturedStations";
import NoSearchResults from "@/components/station-list/NoSearchResults";

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
    (station.language && station.language.toLowerCase().includes(lowerCaseSearchTerm))
  );

  const filteredStationsByLanguage: Record<string, Track[]> = Object.entries(stationsByLanguage)
    .reduce((acc, [language, stations]) => {
      const filtered = stations.filter(station =>
        station.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (station.language && station.language.toLowerCase().includes(lowerCaseSearchTerm))
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

  const showNoResults = searchTerm && filteredUserStations.length === 0 && Object.keys(filteredStationsByLanguage).length === 0;

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        <StationSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

        <UserStations
          stations={filteredUserStations}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentIndex={currentIndex}
          onAddStation={handleAddStation}
          onEditStation={handleEditStation}
          onDeleteStation={handleDeleteStation}
          searchTerm={searchTerm}
          allUserStationsCount={userStations.length}
        />

        <FeaturedStations
          stationsByLanguage={filteredStationsByLanguage}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentIndex={currentIndex}
          onAddStation={handleAddStation}
        />

        {showNoResults && <NoSearchResults />}

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
