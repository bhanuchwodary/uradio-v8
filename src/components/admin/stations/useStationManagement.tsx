
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

  const gridCols = isMobile 
    ? "grid-cols-1" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  // Load current prebuilt stations from Supabase
  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        console.log('Loading stations for admin manager...');
        const currentStations = await fetchPrebuiltStations();
        console.log('Loaded stations:', currentStations.length);
        
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
        
        console.log('Calling delete with ID:', stationToDelete.station.id);
        const result = await adminManageStations('delete', { id: stationToDelete.station.id }, adminPassword);
        console.log("Delete result:", result);
        
        if (result && result.success) {
          const newStations = [...stations];
          newStations.splice(stationToDelete.index, 1);
          setStations(newStations);
          
          toast({
            title: "Station deleted",
            description: `${stationToDelete.station.name} has been removed`
          });
        } else {
          throw new Error("Delete operation failed");
        }
        
        setStationToDelete(null);
      } catch (error) {
        console.error("Failed to delete station:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete station";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        setStationToDelete(null);
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

      // Clean the data
      const cleanData = {
        url: data.url.trim(),
        name: data.name.trim(),
        language: data.language?.trim() || "English"
      };

      const adminPassword = 'J@b1tw$tr3@w';

      if (editingStation.index === -1) {
        // Adding new station
        const { exists, isUserStation } = await checkIfStationExists(cleanData.url);
        if (exists) {
          setEditError(`This URL already exists ${isUserStation ? 'in your stations' : 'in another prebuilt station'}`);
          return;
        }
        
        const urlExists = stations.some(station => 
          station.url.toLowerCase() === cleanData.url.toLowerCase()
        );
        
        if (urlExists) {
          setEditError("This URL already exists in another prebuilt station");
          return;
        }

        console.log("Adding new station with data:", cleanData);
        const result = await adminManageStations('add', cleanData, adminPassword);
        console.log("Add result:", result);

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
          description: `${cleanData.name} has been added to prebuilt stations`
        });
      } else {
        // Editing existing station
        const currentUrl = stations[editingStation.index].url;
        if (currentUrl.toLowerCase() !== cleanData.url.toLowerCase()) {
          const { exists, isUserStation } = await checkIfStationExists(cleanData.url);
          if (exists) {
            setEditError(`This URL already exists ${isUserStation ? 'in your stations' : 'in another prebuilt station'}`);
            return;
          }
          
          const urlExists = stations.some((station, idx) => 
            idx !== editingStation.index && station.url.toLowerCase() === cleanData.url.toLowerCase()
          );
          
          if (urlExists) {
            setEditError("This URL already exists in another prebuilt station");
            return;
          }
        }

        const stationToUpdate = stations[editingStation.index];
        
        if (!stationToUpdate.id) {
          throw new Error("Cannot update station - no ID found");
        }

        const updateData = {
          id: stationToUpdate.id,
          ...cleanData
        };

        console.log("Updating station with data:", updateData);
        const result = await adminManageStations('update', updateData, adminPassword);
        console.log("Update result:", result);

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
          description: `${cleanData.name} has been updated`
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

    const newStations = [...stations];
    let addedCount = 0;
    let skippedCount = 0;

    for (const station of importedStations) {
      const urlExists = stations.some(
        existingStation => existingStation.url.toLowerCase() === station.url.toLowerCase()
      );

      const { exists } = await checkIfStationExists(station.url);

      if (!urlExists && !exists) {
        try {
          const adminPassword = 'J@b1tw$tr3@w';
          const result = await adminManageStations('add', {
            name: station.name.trim(),
            url: station.url.trim(),
            language: station.language?.trim() || "Unknown"
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
