
import { useState, useEffect } from "react";
import { Track } from "@/types/track";
import { supabaseStationsService } from "@/services/supabaseStationsService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const useAdminStationManagement = () => {
  const [stations, setStations] = useState<Track[]>([]);
  const [editingStation, setEditingStation] = useState<{ index: number; station: Track } | null>(null);
  const [stationToDelete, setStationToDelete] = useState<{ index: number; station: Track } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Determine grid columns based on screen size
  const gridCols = isMobile 
    ? "grid-cols-1" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  // Load stations from Supabase on component mount
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const supabaseStations = await supabaseStationsService.getPrebuiltStations();
        console.log("Loaded stations for admin:", supabaseStations.length);
        setStations(supabaseStations);
      } catch (error) {
        console.error("Error loading stations:", error);
        toast({
          title: "Error",
          description: "Failed to load stations",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, [toast]);

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
      // Check if URL already exists in current stations
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

      if (!urlExists) {
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

  const handleSaveChanges = async () => {
    try {
      console.log("Saving all station changes to Supabase");
      const stationsToSave = stations.map(station => ({
        name: station.name,
        url: station.url,
        language: station.language || "Unknown"
      }));
      
      const result = await supabaseStationsService.bulkUpdateStations(stationsToSave);
      return result;
    } catch (error) {
      console.error("Error saving stations:", error);
      return { success: false, error: "Failed to save changes" };
    }
  };

  return {
    stations,
    gridCols,
    editingStation,
    stationToDelete,
    editError,
    showImport,
    loading,
    handleAddStation,
    handleEditStation,
    handleDeleteStation,
    confirmDeleteStation,
    handleSaveEdit,
    setEditingStation,
    setStationToDelete,
    setShowImport,
    handleImportStations,
    handleSaveChanges,
    isMobile
  };
};
