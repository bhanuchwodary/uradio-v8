
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Heart, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { Track } from "@/types/track";
import { prebuiltStations } from "@/data/prebuiltStations";

interface StationListPageProps {
  userStations: Track[];
  onAddToPlaylist: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
}

const StationListPage: React.FC<StationListPageProps> = ({
  userStations,
  onAddToPlaylist,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const renderStationCard = (station: Track, isPrebuilt: boolean = false) => (
    <div key={station.url} className="flex flex-col p-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20">
      <div className="flex justify-center mb-3">
        <Radio className="w-12 h-12 text-primary" />
      </div>
      <h3 className="text-sm font-medium text-center mb-3 line-clamp-2">{station.name}</h3>
      <div className="flex justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            console.log("Adding station to playlist:", station);
            // Make sure we're preserving all properties, especially isFavorite
            onAddToPlaylist({...station});
            toast({
              title: "Station Added",
              description: "The station has been added to your playlist.",
            });
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${station.isFavorite ? 'text-pink-500' : ''}`}
          onClick={() => onToggleFavorite(station)}
        >
          <Heart className="h-4 w-4" fill={station.isFavorite ? "currentColor" : "none"} />
        </Button>
      </div>
    </div>
  );

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
              {userStations.map(station => renderStationCard(station))}
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
              {prebuiltStations.map(station => renderStationCard({
                ...station,
                isFavorite: false,
                isPrebuilt: true,
                playTime: 0
              }, true))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StationListPage;
