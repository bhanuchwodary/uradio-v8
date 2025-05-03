import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Plus, Edit, Trash2, Info } from "lucide-react";
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
  const [lastAddedStation, setLastAddedStation] = useState<Track | null>(null);
  
  const { 
    getUserStations, 
    addUrl, 
    removeStationByValue, 
    editStationByValue,
    tracks,
    debugState
  } = useTrackStateContext();
  
  const userStations = getUserStations();
  
  // Debug information
  useEffect(() => {
    console.log("StationListPage - User stations count:", userStations.length);
    console.log("StationListPage - Total tracks in context:", tracks.length);
    
    // Use debug function if available
    if (debugState) {
      debugState();
    }
  }, [userStations.length, tracks.length, debugState]);

  // Effect to validate that stations were added correctly
  useEffect(() => {
    if (lastAddedStation) {
      // Check if the station exists in the current tracks
      const stationExists = tracks.some(
        track => track.url === lastAddedStation.url && track.name === lastAddedStation.name
      );
      
      console.log("Validating last added station:", lastAddedStation.name);
      console.log("Station exists in tracks:", stationExists);
      
      if (!stationExists) {
        console.warn("Station was not properly added to tracks:", lastAddedStation);
        
        // Try to add it again if it's not there
        setTimeout(() => {
          console.log("Re-attempting to add station:", lastAddedStation.name);
          addUrl(
            lastAddedStation.url,
            lastAddedStation.name,
            lastAddedStation.isPrebuilt,
            lastAddedStation.isFavorite
          );
        }, 500);
      }
      
      // Reset after check
      setLastAddedStation(null);
    }
  }, [lastAddedStation, tracks, addUrl]);

  const handleAddStation = (station: Track) => {
    console.log("Adding station to playlist:", JSON.stringify(station));
    
    // Keep a reference to the last added station to validate it was added correctly
    setLastAddedStation({...station});
    
    // Create a complete copy of the station to preserve all properties
    const result = addUrl(
      station.url, 
      station.name, 
      station.isPrebuilt || false, 
      station.isFavorite || false
    );
    
    console.log("Result of adding station to playlist:", result);
    
    if (result.success) {
      toast({
        title: "Station Added",
        description: `${station.name} has been added to your playlist.`,
      });
      
      // Pre-fetch the updated tracks before navigating
      setTimeout(() => {
        console.log("Verifying tracks before navigation:", tracks.length);
        navigate("/playlist");
      }, 300);
    } else {
      toast({
        title: "Failed to Add Station",
        description: result.message || "There was an error adding the station.",
        variant: "destructive"
      });
    }
  };

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
            onClick={() => handleAddStation(station)}
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

        {/* Station Status Debug (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-2 bg-gray-800 text-white text-xs rounded">
            <div className="flex items-center gap-2">
              <Info size={16} />
              <span>Tracks in memory: {tracks.length}</span>
            </div>
          </div>
        )}

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
