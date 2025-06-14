
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AddUrlForm from "@/components/AddUrlForm";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Upload } from "lucide-react";

const AddStationPage: React.FC = () => {
  const { addUrl } = useTrackStateContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddUrl = (url: string, name: string, language: string) => {
    const result = addUrl(url, name, false, false, language);
    
    if (result.success) {
      toast({
        title: "Station Added",
        description: name
          ? `${name} has been added to your stations.`
          : "The station has been added to your stations.",
      });
      // Navigate to the playlist page after successful add
      setTimeout(() => navigate("/playlist"), 500);
      return true;
    } else {
      toast({
        title: "Station Not Added",
        description: result.message || "Failed to add station.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleImport = (stations: Array<{ name: string; url: string; language?: string }>) => {
    const addedStations = stations.filter(station => {
      const result = addUrl(station.url, station.name, false, false, station.language);
      return result.success;
    });
    
    if (addedStations.length > 0) {
      toast({
        title: "Stations Imported",
        description: `${addedStations.length} stations have been imported.`,
      });
      // Navigate to the playlist page after successful import
      setTimeout(() => navigate("/playlist"), 500);
    } else {
      toast({
        title: "Import Failed",
        description: "No stations were imported. Please check the format and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 pt-4">
        {/* Heading already clear and prominent, but will ensure visually distinct style */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2 py-2 px-1 rounded-lg shadow-lg">
          <Plus className="h-5 w-5 text-primary" />
          Add Station
        </h1>
        
        <div className="max-w-lg mx-auto space-y-6">
          <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Add Radio Station</CardTitle>
              <CardDescription>Enter the URL and name of the radio station you want to add</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <AddUrlForm onAddUrl={handleAddUrl} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
            <CardHeader className="pb-3 px-3 sm:px-6">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Stations
              </CardTitle>
              <CardDescription>Import multiple stations from a CSV file</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ImportStationsFromCsv onImport={handleImport} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AddStationPage;
