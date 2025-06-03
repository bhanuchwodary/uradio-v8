
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EditStationDialog from "@/components/EditStationDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AdminStationsHeader from "./stations/AdminStationsHeader";
import StationGrid from "./stations/StationGrid";
import StationImportSection from "./stations/StationImportSection";
import { useAdminStationManagement } from "./stations/useAdminStationManagement";
import { useToast } from "@/hooks/use-toast";

interface AdminStationsManagerProps {
  onSave: (stations: any[]) => void;
  onCancel: () => void;
}

const AdminStationsManager: React.FC<AdminStationsManagerProps> = ({ onSave, onCancel }) => {
  const { toast } = useToast();
  
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
    handleSaveChanges,
    isMobile
  } = useAdminStationManagement();

  const onSaveChanges = async () => {
    const result = await handleSaveChanges();
    if (result.success) {
      toast({
        title: "Success",
        description: "Prebuilt stations have been updated successfully"
      });
      // Clear admin authentication and navigate back
      sessionStorage.removeItem("admin_authenticated");
      window.location.href = "/station-list";
    } else {
      toast({
        title: "Error", 
        description: result.error || "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
        <CardContent className="flex justify-center items-center py-12">
          <div className="text-lg">Loading stations...</div>
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
          <Button onClick={onSaveChanges} className="w-full sm:w-auto">
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
