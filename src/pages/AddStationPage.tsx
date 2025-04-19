
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import AddUrlForm from "@/components/AddUrlForm";
import ImportStationsFromCsv from "@/components/ImportStationsFromCsv";
import { prebuiltStations } from "@/data/prebuiltStations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useNavigate } from "react-router-dom";

const AddStationPage = () => {
  const { addUrl } = useMusicPlayer();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddPrebuiltStation = (name: string, url: string) => {
    addUrl(url, name);
    toast({
      title: "Station added",
      description: `${name} has been added to your playlist`,
    });
    navigate("/playlist");
  };

  return (
    <div className="min-h-screen p-3 md:p-4 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-2xl mx-auto space-y-4">
        <Navigation />
        
        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader>
            <CardTitle>Add Station</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddUrlForm />
            <ImportStationsFromCsv />
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg">
          <CardHeader>
            <CardTitle>Prebuilt Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {prebuiltStations.map((station, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start bg-white/10 hover:bg-white/20 border-none"
                  onClick={() => handleAddPrebuiltStation(station.name, station.url)}
                >
                  {station.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddStationPage;
