
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Shield } from "lucide-react";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getPrebuiltStations } from "@/utils/prebuiltStationsManager";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminStationsManagerProps {
  onSave: (stations: any[]) => void;
  onCancel: () => void;
}

const AdminStationsManager: React.FC<AdminStationsManagerProps> = ({ onSave, onCancel }) => {
  const [stations, setStations] = useState<Track[]>([]);
  const [editingStation, setEditingStation] = useState<{ index: number; station: Track } | null>(null);
  const [stationToDelete, setStationToDelete] = useState<{ index: number; station: Track } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const { toast } = useToast();
  const { checkIfStationExists } = useTrackStateContext();
  const isMobile = useIsMobile();

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

  const handleSaveChanges = () => {
    // Convert the stations back to the format used in prebuiltStations.ts
    console.log("Saving all station changes");
    const stationsToSave = stations.map(station => ({
      name: station.name,
      url: station.url,
      language: station.language || "Unknown"
    }));
    
    onSave(stationsToSave);
  };

  // Determine grid columns based on screen size
  const gridCols = isMobile 
    ? "grid-cols-1" 
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
      <CardHeader className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin Station Manager
          </CardTitle>
          <CardDescription>
            Add, edit or remove prebuilt radio stations
          </CardDescription>
        </div>
        <Button onClick={handleAddStation} size={isMobile ? "sm" : "default"} className="flex self-start sm:self-center items-center gap-1">
          <Plus className="h-4 w-4" /> Add Station
        </Button>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols} gap-4 mb-6`}>
          {stations.map((station, index) => (
            <div
              key={`${station.url}-${index}`}
              className="flex flex-col p-4 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-background/80 material-shadow-1 hover:material-shadow-2 material-transition"
            >
              <div className="flex-1">
                <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                  {station.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                  {station.language || "Unknown"}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-500 hover:text-blue-700"
                  onClick={() => handleEditStation(index)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteStation(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
        
        {editingStation && (
          <EditStationDialog
            isOpen={true}
            onClose={() => {
              setEditingStation(null);
              setEditError(null);
            }}
            onSave={handleSaveEdit}
            initialValues={{
              url: editingStation.station.url,
              name: editingStation.station.name,
              language: editingStation.station.language
            }}
            error={editError}
          />
        )}
        
        <AlertDialog open={stationToDelete !== null} onOpenChange={() => setStationToDelete(null)}>
          <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove {stationToDelete?.station.name} from the prebuilt stations list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteStation} className="w-full sm:w-auto">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default AdminStationsManager;
