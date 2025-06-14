
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddUrlForm from "@/components/AddUrlForm";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, Link as LinkIcon } from "lucide-react";

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
      <div className="container mx-auto max-w-lg space-y-6 pt-4 animate-fade-in">
        <Card className="bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-md border-border/30 shadow-xl">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Station
            </CardTitle>
            <CardDescription>
              Add a single station by URL or import multiple from a CSV file.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Add by URL
                </TabsTrigger>
                <TabsTrigger value="csv">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-6">
                <AddUrlForm onAddUrl={handleAddUrl} />
              </TabsContent>
              <TabsContent value="csv" className="pt-6">
                <ImportStationsFromCsv onImport={handleImport} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddStationPage;
