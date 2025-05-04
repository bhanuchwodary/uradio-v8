
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddUrlForm from "@/components/AddUrlForm";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AddStationPage: React.FC = () => {
  const { addUrl } = useTrackStateContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddUrl = (url: string, name: string) => {
    const result = addUrl(url, name, false);
    
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
  
  const handleImport = (stations: Array<{ name: string; url: string }>) => {
    const addedStations = stations.filter(station => {
      const result = addUrl(station.url, station.name);
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
      <div className="container mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-white">Add Station</h1>
        
        <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Add Radio Station</CardTitle>
          </CardHeader>
          <CardContent>
            <AddUrlForm onAddUrl={handleAddUrl} />
          </CardContent>
        </Card>

        <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Import Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportStationsFromCsv onImport={handleImport} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddStationPage;
