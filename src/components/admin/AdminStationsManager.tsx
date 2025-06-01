import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditStationDialog from "@/components/EditStationDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTrackStateContext } from "@/context/TrackStateContext";
import AdminStationsHeader from "./stations/AdminStationsHeader";
import StationGrid from "./stations/StationGrid";
import StationImportSection from "./stations/StationImportSection";
import { useStationManagement } from "./stations/useStationManagement";
import { Loader2 } from "lucide-react";

interface AdminStationsManagerProps {
  onSave: (stations: any[], adminPassword: string) => void;
  onCancel: () => void;
}

const AdminStationsManager: React.FC<AdminStationsManagerProps> = ({ onSave, onCancel }) => {
  const { checkIfStationExists } = useTrackStateContext();
  
  // Create a wrapper function to handle the async checkIfStationExists
  const checkIfStationExistsSync = async (url: string) => {
    try {
      return await checkIfStationExists(url);
    } catch (error) {
      console.error('Error checking station existence:', error);
      return { exists: false, isUserStation: false };
    }
  };
  
  const {
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
  } = useStationManagement({ checkIfStationExists: checkIfStationExistsSync });

  const handleSaveChanges = () => {
    const stationsToSave = prepareStationsForSave();
    const adminPassword = 'J@b1tw$tr3@w'; // In production, get this securely
    onSave(stationsToSave, adminPassword);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading stations from database...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
      <AdminStationsHeader 
        onAddStation={handleAddStation} 
        onToggleImport={() => setShowImport(!showImport)}
        showImport={showImport}
        isMobile={isMobile}
      />

      <CardContent>
        {showImport && (
          <StationImportSection onImport={handleImportStations} />
        )}
        
        <StationGrid 
          stations={stations} 
          gridCols={gridCols} 
          onEdit={handleEditStation} 
          onDelete={handleDeleteStation} 
        />
        
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
                This will permanently remove {stationToDelete?.station.name} from the prebuilt stations list for all users.
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
