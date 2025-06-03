
import { useState, useEffect } from "react";
import { Track } from "@/types/track";
import { newAdminStationsService, AdminStationData } from "@/services/newAdminStationsService";
import { adminAuthService } from "@/services/adminAuthService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export const useNewAdminStationManagement = () => {
  const [stations, setStations] = useState<Track[]>([]);
  const [editingStation, setEditingStation] = useState<{ index: number; station: Track } | null>(null);
  const [stationToDelete, setStationToDelete] = useState<{ index: number; station: Track } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const gridCols = isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  useEffect(() => {
    const loadStations = async () => {
      if (!adminAuthService.isAdminAuthenticated()) {
        console.log("Admin not authenticated, skipping station load");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const supabaseStations = await newAdminStationsService.getPrebuiltStations();
        console.log(`Admin loaded ${supabaseStations.length} stations`);
        setStations(supabaseStations);
        setHasChanges(false);
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
    setEditingStation({
      index,
      station: stations[index]
    });
    setEditError(null);
  };

  const handleDeleteStation = (index: number) => {
    setStationToDelete({
      index,
      station: stations[index]
    });
  };

  const confirmDeleteStation = () => {
    if (stationToDelete !== null) {
      const newStations = [...stations];
      newStations.splice(stationToDelete.index, 1);
      setStations(newStations);
      setHasChanges(true);
      
      toast({
        title: "Station removed",
        description: `${stationToDelete.station.name} will be removed when you save changes`
      });
      
      setStationToDelete(null);
    }
  };

  const handleSaveEdit = (data: { url: string; name: string; language?: string }) => {
    if (editingStation === null) return;
    
    // Check for duplicate URLs
    if (editingStation.index === -1) {
      const urlExists = stations.some(station => 
        station.url.toLowerCase() === data.url.toLowerCase()
      );
      
      if (urlExists) {
        setEditError("This URL already exists in another prebuilt station");
        return;
      }
    } else {
      const currentUrl = stations[editingStation.index].url;
      if (currentUrl.toLowerCase() !== data.url.toLowerCase()) {
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
      newStations.push(station);
      toast({
        title: "Station added",
        description: `${data.name} will be added when you save changes`
      });
    } else {
      newStations[editingStation.index] = station;
      toast({
        title: "Station updated",
        description: `${data.name} changes will be saved when you save all changes`
      });
    }
    
    setStations(newStations);
    setHasChanges(true);
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

    const newStations = [...stations];
    let addedCount = 0;
    let skippedCount = 0;

    importedStations.forEach(station => {
      const urlExists = stations.some(
        existingStation => existingStation.url.toLowerCase() === station.url.toLowerCase()
      );

      if (!urlExists) {
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
      setHasChanges(true);
      toast({
        title: "Stations Imported",
        description: `Added ${addedCount} stations${skippedCount > 0 ? `, skipped ${skippedCount} duplicates` : ''}. Save changes to apply.`,
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
      console.log("Admin: Saving all station changes");
      const stationsToSave: AdminStationData[] = stations.map(station => ({
        name: station.name,
        url: station.url,
        language: station.language || "Unknown"
      }));
      
      const result = await newAdminStationsService.bulkReplaceStations(stationsToSave);
      
      if (result.success) {
        setHasChanges(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
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
    hasChanges,
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
