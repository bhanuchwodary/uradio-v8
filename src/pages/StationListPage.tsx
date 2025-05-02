
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Plus, Edit, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Track } from "@/types/track";
import { prebuiltStations } from "@/data/prebuiltStations";
import EditStationDialog from "@/components/EditStationDialog";
import { useTrackStateContext } from "@/context/TrackStateContext";

const StationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingStation, setEditingStation] = useState<Track | null>(null);
  const { 
    getUserStations, 
    addUrl, 
    removeStationByValue, 
    editStationByValue 
  } = useTrackStateContext();
  
  const userStations = getUserStations();
  console.log("StationListPage - User stations count:", userStations.length);

  const renderStationCard = (station: Track, isPrebuilt: boolean = false) => {
    // Generate a truly unique key for each station card
    const uniqueKey = `${station.url}-${isPrebuilt ? 'prebuilt' : 'user'}-${station.name}`;
    
    return (
      <div key={uniqueKey} className="flex flex-col p-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20">
        <div className="flex justify-center mb-3">
          <Radio className={`w-12 h-12 text-primary`} />
        </div>
        <h3 className="text-sm font-medium text-center mb-3 line-clamp-2">{station.name}</h3>
        <div className="flex justify-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              console.log("Adding station to playlist:", station);
              // Create a complete copy of the station to preserve all properties
              const stationCopy = {...station};
              console.log("Station copy being added:", stationCopy);
              
              const result = addUrl(stationCopy.url, stationCopy.name, stationCopy.isPrebuilt, stationCopy.isFavorite);
              console.log("Result of adding station to playlist:", result);
              
              toast({
                title: "Station Added",
                description: "The station has been added to your playlist.",
              });
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          {!isPrebuilt && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-500 hover:text-blue-700"
              onClick={() => setEditingStation(station)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {!isPrebuilt && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={() => {
                removeStationByValue(station);
                toast({
                  title: "Station Removed",
                  description: `${station.name} has been removed from your stations.`,
                });
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleSaveEdit = (data: { url: string; name: string }) => {
    if (editingStation) {
      editStationByValue(editingStation, data);
      toast({
        title: "Station Updated",
        description: `${data.name} has been updated.`,
      });
    }
    setEditingStation(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Navigation />
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Station List</h1>
          <Button
            onClick={() => navigate("/add-station")}
            className="bg-primary text-primary-foreground"
          >
            Add New Station
          </Button>
        </div>

        {/* User Stations */}
        <Card className="bg-white/10 backdrop-blur-md border-none">
          <CardHeader>
            <CardTitle>My Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userStations.length > 0 ? (
                userStations.map(station => renderStationCard(station))
              ) : (
                <p className="col-span-full text-center text-gray-400">
                  No custom stations added yet. Add one to see it here!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prebuilt Stations */}
        <Card className="bg-white/10 backdrop-blur-md border-none">
          <CardHeader>
            <CardTitle>Prebuilt Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {prebuiltStations.map(station => {
                const prebuiltStation = {
                  ...station,
                  isFavorite: false,
                  isPrebuilt: true,
                  playTime: 0
                };
                return renderStationCard(prebuiltStation, true);
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {editingStation && (
        <EditStationDialog
          isOpen={!!editingStation}
          onClose={() => setEditingStation(null)}
          onSave={handleSaveEdit}
          initialValues={{
            url: editingStation.url,
            name: editingStation.name,
          }}
        />
      )}
    </div>
  );
};

export default StationListPage;
