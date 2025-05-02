
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddUrlForm from "@/components/AddUrlForm";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useTrackStateContext } from "@/context/TrackStateContext";

const AddStationPage: React.FC = () => {
  const { addUrl } = useTrackStateContext();
  const { toast } = useToast();

  const handleAddUrl = (url: string, name: string) => {
    console.log("HandleAddUrl called with:", url, name);
    const result = addUrl(url, name, false);
    console.log("Result from handleAddStation:", result);
    
    if (result.success) {
      toast({
        title: "Station Added",
        description: name
          ? `${name} has been added to your stations.`
          : "The station has been added to your stations.",
      });
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
    console.log("Importing stations:", stations.length);
    stations.forEach(station => {
      addUrl(station.url, station.name);
    });
    toast({
      title: "Stations Imported",
      description: `${stations.length} stations have been imported.`,
    });
  };

  return (
    <div className="min-h-screen p-3 md:p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-6">
        <Navigation />
        
        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">Add Radio Station</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <AddUrlForm onAddUrl={handleAddUrl} />
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl">Import Stations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <ImportStationsFromCsv onImport={handleImport} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddStationPage;
