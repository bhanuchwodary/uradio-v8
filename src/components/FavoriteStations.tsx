
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Music, Heart } from "lucide-react";
import { Track } from "@/types/track";

interface FavoriteStationsProps {
  stations: Track[];
  onSelectStation: (index: number) => void;
}

const FavoriteStations: React.FC<FavoriteStationsProps> = ({ stations, onSelectStation }) => {
  if (stations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-none shadow-lg w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Favorite Stations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stations.map((station, index) => (
            <div
              key={station.url}
              className="flex flex-col p-4 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              <button
                className="flex flex-col items-center gap-3 w-full"
                onClick={() => onSelectStation(index)}
              >
                <Radio className="w-12 h-12 text-primary hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center hover:text-primary transition-colors line-clamp-2">
                  {station.name}
                </span>
              </button>
              <div className="flex justify-center mt-3">
                <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FavoriteStations;
