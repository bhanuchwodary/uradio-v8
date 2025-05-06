
import React from "react";
import { Track } from "@/types/track";
import EditStationDialog from "@/components/EditStationDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface PlaylistDialogsProps {
  editingStation: Track | null;
  stationToDelete: Track | null;
  onCloseEditDialog: () => void;
  onSaveEdit: (data: { url: string; name: string }) => void;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
}

const PlaylistDialogs: React.FC<PlaylistDialogsProps> = ({
  editingStation,
  stationToDelete,
  onCloseEditDialog,
  onSaveEdit,
  onCloseDeleteDialog,
  onConfirmDelete
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  return (
    <>
      {/* Edit station dialog */}
      {editingStation && (
        <EditStationDialog
          isOpen={!!editingStation}
          onClose={onCloseEditDialog}
          onSave={onSaveEdit}
          initialValues={{
            url: editingStation.url,
            name: editingStation.name,
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog 
        open={!!stationToDelete} 
        onOpenChange={(open) => !open && onCloseDeleteDialog()}
      >
        <AlertDialogContent className={cn(
          "border-none",
          isDark ? "bg-background/70 backdrop-blur-md" : "bg-white/90 backdrop-blur-md"
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Remove Station</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to remove "{stationToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(
              isDark ? "bg-background/50 hover:bg-background/70" : "bg-background/70 hover:bg-background/90"
            )}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PlaylistDialogs;
