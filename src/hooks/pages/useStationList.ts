
import { useState } from "react";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useToast } from "@/hooks/use-toast";
import { getStations } from "@/data/featuredStationsLoader";
import { Track } from "@/types/track";

export const useStationList = () => {
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    tracks,
    currentIndex,
    isPlaying,
    editStationByValue,
    removeStationByValue,
    getUserStations
  } = useTrackStateContext();

  // Get playlist functionality with isInPlaylist check
  const { addToPlaylist, isInPlaylist } = usePlaylist();

  // Get current track from audio player context instead of track state
  const { currentTrack } = useAudioPlayer();

  // Get user stations from library
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

  // Add station to playlist handler (using PlaylistContext)
  const handleAddStation = (station: Track) => {
    console.log("Adding station to playlist:", station.name, station.url);
    
    // Check if already in playlist before attempting to add
    if (isInPlaylist(station.url)) {
      console.log("Station already in playlist");
      toast({
        title: "Station Already in Playlist",
        description: `${station.name} is already in your playlist`,
        variant: "destructive"
      });
      return;
    }

    const success = addToPlaylist(station);

    if (success) {
      console.log("Successfully added to playlist");
      toast({
        title: "Station Added to Playlist",
        description: `${station.name} has been added to your playlist`,
      });
    } else {
      console.log("Failed to add to playlist");
      toast({
        title: "Failed to Add Station",
        description: `Could not add ${station.name} to your playlist`,
        variant: "destructive"
      });
    }
  };

  // Handle edit station (edits in main library)
  const handleEditStation = (station: Track) => {
    setEditingStation(station);
  };

  // Handle delete station (removes from main library)
  const handleDeleteStation = (station: Track) => {
    removeStationByValue(station);
    toast({
      title: "Station removed",
      description: `${station.name} has been removed from your stations`
    });
  };

  // Save edited station (updates in main library)
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

  return {
    editingStation,
    searchTerm,
    setSearchTerm,
    filteredUserStations,
    currentTrack,
    isPlaying,
    currentIndex,
    userStations,
    filteredStationsByLanguage,
    handleAddStation,
    handleEditStation,
    handleDeleteStation,
    handleSaveEdit,
    setEditingStation,
    showNoResults,
    isInPlaylist, // Export isInPlaylist for components to use
  };
};
