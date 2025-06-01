
import { useState, useEffect } from "react";
import { Track } from "@/types/track";
import { fetchPrebuiltStations, adminManageStations } from "@/services/prebuiltStationsService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseStationManagementProps {
  checkIfStationExists: (url: string) => Promise<{ exists: boolean; isUserStation: boolean }>;
}

export const useStationManagement = ({ checkIfStationExists }: UseStationManagementProps) => {
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

  // Load current prebuilt stations from Supabase
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        const currentStations = await fetchPrebuiltStations();
        console.log("Loading stations for admin manager:", currentStations.length);
        
        // Convert to Track objects
        const trackStations = currentStations.map(station => ({
          ...station,
          isFavorite: false,
          isPrebuilt: true,
          playTime: 0
        }));
        
        setStations(trackStations);
      } catch (error) {
        console.error("Failed to load stations:", error);
        toast({
          title: "Error",
          description: "Failed to load stations from database",
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

  const confirmDeleteStation = async () => {
    if (stationToDelete !== null) {
      try {
        console.log("Confirming deletion of station:", stationToDelete.station.name);
        
        const adminPassword = 'J@b1tw$tr3@w';
        
        if (!stationToDelete.station.id) {
          console.error("No station ID found for deletion");
          toast({
            title: "Error",
            description: "Cannot delete station - no ID found",
            variant: "destructive"
          });
          return;
        }
        
        await adminManageStations('delete', { id: stationToDelete.station.id }, adminPassword);
        
        const newStations = [...stations];
        newStations.splice(stationToDelete.index, 1);
        setStations(newStations);
        
        toast({
          title: "Station deleted",
          description: `${stationToDelete.station.name} has been removed`
        });
        
        setStationToDelete(null);
      } catch (error) {
        console.error("Failed to delete station:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete station";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveEdit = async (data: { url: string; name: string; language?: string }) => {
    if (editingStation === null) return;
    
    console.log("Saving station edit:", data);
    
    try {
      // Validate required fields
      if (!data.url || !data.name) {
        setEditError("URL and name are required");
        return;
      }

      // Check if this is a new station or editing an existing one
      if (editingStation.index === -1) {
        // For new stations, check if URL already exists
        const { exists, isUserStation } = await checkIfStationExists(data.url);
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

        // Add new station via API
        const adminPassword = 'J@b1tw$tr3@w';
        const result = await adminManageStations('add', {
          name: data.name,
          url: data.url,
          language: data.language || "English"
        }, adminPassword);

        if (!result || !result.station) {
          throw new Error("Failed to create station - no data returned");
        }

        const newStation: Track = {
          ...result.station,
          isFavorite: false,
          isPrebuilt: true,
          playTime: 0
        };

        setStations([...stations, newStation]);
        
        toast({
          title: "Station added",
          description: `${data.name} has been added to prebuilt stations`
        });
      } else {
        // Editing existing station
        const currentUrl = stations[editingStation.index].url;
        if (currentUrl.toLowerCase() !== data.url.toLowerCase()) {
          // URL is being changed, check if new URL exists
          const { exists, isUserStation } = await checkIfStationExists(data.url);
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

        // Update existing station via API
        const adminPassword = 'J@b1tw$tr3@w';
        const stationToUpdate = stations[editingStation.index];
        
        if (!stationToUpdate.id) {
          throw new Error("Cannot update station - no ID found");
        }

        const result = await adminManageStations('update', {
          id: stationToUpdate.id,
          name: data.name,
          url: data.url,
          language: data.language || "English"
        }, adminPassword);

        if (!result || !result.station) {
          throw new Error("Failed to update station - no data returned");
        }

        const newStations = [...stations];
        newStations[editingStation.index] = {
          ...result.station,
          isFavorite: false,
          isPrebuilt: true,
          playTime: 0
        };
        setStations(newStations);
        
        toast({
          title: "Station updated",
          description: `${data.name} has been updated`
        });
      }
      
      setEditingStation(null);
      setEditError(null);
    } catch (error) {
      console.error("Failed to save station:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save station. Please try again.";
      setEditError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleImportStations = async (importedStations: Array<{ name: string; url: string; language?: string }>) => {
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

    for (const station of importedStations) {
      // Check if URL already exists in current stations
      const urlExists = stations.some(
        existingStation => existingStation.url.toLowerCase() === station.url.toLowerCase()
      );

      // Check if URL exists in user stations
      const { exists, isUserStation } = await checkIfStationExists(station.url);

      if (!urlExists && !exists) {
        try {
          // Add via API
          const adminPassword = 'J@b1tw$tr3@w';
          const result = await adminManageStations('add', {
            name: station.name,
            url: station.url,
            language: station.language || "Unknown"
          }, adminPassword);

          if (result && result.station) {
            newStations.push({
              ...result.station,
              isFavorite: false,
              isPrebuilt: true,
              playTime: 0
            });
            addedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error("Failed to add imported station:", error);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

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
    // Return the stations in the format expected by the bulk update
    console.log("Preparing stations for bulk save");
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
    prepareStationsForSave,
    isMobile
  };
};
