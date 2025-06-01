
import { useState, useEffect } from "react";
import { Track } from "@/types/track";
import { getPrebuiltStations } from "@/utils/prebuiltStationsManager";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseStationManagementProps {
  checkIfStationExists: (url: string) => { exists: boolean; isUserStation: boolean };
}

export const useStationManagement = ({ checkIfStationExists }: UseStationManagementProps) => {
  const [stations, setStations] = useState<Track[]>([]);
  const [editingStation, setEditingStation] = useState<{ index: number; station: Track } | null>(null);
  const [stationToDelete, setStationToDelete] = useState<{ index: number; station: Track } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Determine grid columns based on screen size
  const gridCols = isMobile 
    ? "grid-cols-1" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  // Load current prebuilt stations on component mount
  useEffect(() => {
    const currentStations = getPrebuiltStations();
    console.log("Loading stations for admin manager:", currentStations.length);
    
    // Convert to Track objects
    const trackStations = currentStations.map(station => ({
      ...station,
      isFavorite: false,
      isPrebuilt: true,
      playTime: 0
    }));
    
    setStations(trackStations);
  }, []);

  const handleAddStation = () => {
    console.log("Adding new station");
    setEditingStation({
      index: -1,
      station: { 
        url: "", 
        name: "", 
        language: "English",
        isFavorite: false,
        isPrebuilt: true,
        playTime: 0
      }
    });
    setEditError(null);
  };

  const handleEditStation = (index: number) => {
    console.log("Editing station at index:", index);
    setEditingStation({
      index,
      station: stations[index]
    });
    setEditError(null);
  };

  const handleDeleteStation = (index: number) => {
    console.log("Preparing to delete station at index:", index);
    setStationToDelete({
      index,
      station: stations[index]
    });
  };

  const confirmDeleteStation = () => {
    if (stationToDelete !== null) {
      console.log("Confirming deletion of station:", stationToDelete.station.name);
      const newStations = [...stations];
      newStations.splice(stationToDelete.index, 1);
      setStations(newStations);
      
      toast({
        title: "Station deleted",
        description: `${stationToDelete.station.name} has been removed`
      });
      
      setStationToDelete(null);
    }
  };

  const handleSaveEdit = (data: { url: string; name: string; language?: string }) => {
    if (editingStation === null) return;
    
    console.log("Saving station edit:", data);
    
    // Check if this is a new station or editing an existing one
    if (editingStation.index === -1) {
      // For new stations, check if URL already exists in user stations
      const { exists, isUserStation } = checkIfStationExists(data.url);
      if (exists) {
        setEditError(`This URL already exists ${isUserStation ? 'in your stations' : 'in another prebuilt station'}`);
        return;
      }
      
      // Also check if URL exists in current prebuilt stations being edited
      const urlExists = stations.some(station => 
        station.url.toLowerCase() === data.url.toLowerCase()
      );
      
      if (urlExists) {
        setEditError("This URL already exists in another prebuilt station");
        return;
      }
    } else {
      // For existing stations, check if changing to a URL that already exists elsewhere
      const currentUrl = stations[editingStation.index].url;
      if (currentUrl.toLowerCase() !== data.url.toLowerCase()) {
        // URL is being changed, check if new URL exists
        const { exists, isUserStation } = checkIfStationExists(data.url);
        if (exists) {
          setEditError(`This URL already exists ${isUserStation ? 'in your stations' : 'in another prebuilt station'}`);
          return;
        }
        
        // Check within current stations list (excluding the one being edited)
        const urlExists = stations.some((station, idx) => 
          idx !== editingStation.index && station.url.toLowerCase() === data.url.toLowerCase()
        );
        
        if (urlExists) {
          setEditError("This URL already exists in another prebuilt station");
          return;
        }
      }
    }
    
    const newStations = [...stations];
    const station: Track = {
      url: data.url,
      name: data.name,
      language: data.language || "English",
      isFavorite: false,
      isPrebuilt: true,
      playTime: 0
    };
    
    if (editingStation.index === -1) {
      // Adding new station
      newStations.push(station);
      toast({
        title: "Station added",
        description: `${data.name} has been added to prebuilt stations`
      });
    } else {
      // Editing existing station
      newStations[editingStation.index] = station;
      toast({
        title: "Station updated",
        description: `${data.name} has been updated`
      });
    }
    
    setStations(newStations);
    setEditingStation(null);
    setEditError(null);
  };

  const handleImportStations = (importedStations: Array<{ name: string; url: string; language?: string }>) => {
    if (!Array.isArray(importedStations) || importedStations.length === 0) {
      toast({
        title: "Import Error",
        description: "No valid stations were found in the imported data.",
        variant: "destructive",
      });
      return;
    }

    // Filter out stations that already exist
    const newStations = [...stations];
    let addedCount = 0;
    let skippedCount = 0;

    importedStations.forEach(station => {
      // Check if URL already exists in current stations
      const urlExists = stations.some(
        existingStation => existingStation.url.toLowerCase() === station.url.toLowerCase()
      );

      // Check if URL exists in user stations
      const { exists, isUserStation } = checkIfStationExists(station.url);

      if (!urlExists && !exists) {
        // Add as new station
        newStations.push({
          url: station.url,
          name: station.name,
          language: station.language || "Unknown",
          isFavorite: false,
          isPrebuilt: true,
          playTime: 0
        });
        addedCount++;
      } else {
        skippedCount++;
      }
    });

    if (addedCount > 0) {
      setStations(newStations);
      toast({
        title: "Stations Imported",
        description: `Added ${addedCount} stations${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}.`,
      });
      setShowImport(false);
    } else {
      toast({
        title: "No New Stations",
        description: `All ${skippedCount} stations already exist in your collection.`,
        variant: "destructive",
      });
    }
  };

  const prepareStationsForSave = () => {
    // Convert the stations back to the format used in prebuiltStations.ts
    console.log("Saving all station changes");
    return stations.map(station => ({
      name: station.name,
      url: station.url,
      language: station.language || "Unknown"
    }));
  };

  return {
    stations,
    gridCols,
    editingStation,
    stationToDelete,
    editError,
    showImport,
    handleAddStation,
    handleEditStation,
    handleDeleteStation,
    confirmDeleteStation,
    handleSaveEdit,
    setEditingStation,
    setStationToDelete,
    setShowImport,
    handleImportStations,
    prepareStationsForSave,
    isMobile
  };
};
