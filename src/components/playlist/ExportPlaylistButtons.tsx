
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileJson } from "lucide-react";
import { PlaylistTrack } from "@/context/PlaylistContext";
import { exportPlaylistAsJSON, exportPlaylistAsCSV } from "@/utils/playlistExport";
import { useToast } from "@/hooks/use-toast";

interface ExportPlaylistButtonsProps {
  tracks: PlaylistTrack[];
  disabled?: boolean;
}

const ExportPlaylistButtons: React.FC<ExportPlaylistButtonsProps> = ({
  tracks,
  disabled = false
}) => {
  const { toast } = useToast();

  const handleExportJSON = () => {
    try {
      const count = exportPlaylistAsJSON(tracks);
      toast({
        title: "Playlist exported as JSON",
        description: `Successfully exported ${count} stations to JSON file`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export playlist as JSON",
        variant: "destructive"
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const count = exportPlaylistAsCSV(tracks);
      toast({
        title: "Playlist exported as CSV",
        description: `Successfully exported ${count} stations to CSV file`
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export playlist as CSV",
        variant: "destructive"
      });
    }
  };

  if (disabled || tracks.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportJSON}
        className="flex items-center gap-2"
        aria-label="Export playlist as JSON"
      >
        <span className="inline-flex sm:hidden">
          <FileJson className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline-flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          JSON
        </span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="flex items-center gap-2"
        aria-label="Export playlist as CSV"
      >
        <span className="inline-flex sm:hidden">
          <FileText className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline-flex items-center gap-2">
          <FileText className="h-4 w-4" />
          CSV
        </span>
      </Button>
    </div>
  );
};

export default ExportPlaylistButtons;
