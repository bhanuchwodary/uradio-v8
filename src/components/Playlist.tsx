
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Radio, Edit, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import EditStationDialog from "./EditStationDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Track } from "@/types/track";

interface PlaylistProps {
  urls: string[];
  tracks?: Track[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
  onRemoveTrack: (index: number) => void;
  onEditTrack?: (index: number, data: { url: string; name: string }) => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  urls,
  tracks,
  currentIndex,
  onSelectTrack,
  onRemoveTrack,
  onEditTrack,
}) => {
  const [editingTrack, setEditingTrack] = useState<{ index: number; data: { url: string; name: string } } | null>(null);
  const isMobile = useIsMobile();
  
  // Debug log to ensure tracks are being received
  useEffect(() => {
    console.log("Playlist component received tracks:", tracks);
  }, [tracks]);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="text-center p-3 text-gray-500">
        No tracks added. Add a URL to get started.
      </div>
    );
  }

  const userStations = tracks.filter(track => track.isPrebuilt === false);
  const prebuiltStations = tracks.filter(track => track.isPrebuilt === true);
  
  console.log("User stations:", userStations);
  console.log("Prebuilt stations:", prebuiltStations);

  const renderStationsList = (stationsList: Track[], title: string) => {
    if (stationsList.length === 0) return null;

    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stationsList.map((track, i) => {
            const index = tracks.indexOf(track);
            const isActive = index === currentIndex;
            return (
              <div
                key={index}
                className={`flex flex-col p-4 rounded-lg ${
                  isActive
                    ? "bg-primary/20 backdrop-blur-sm"
                    : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
                }`}
              >
                <div className="flex justify-center mb-3">
                  <Radio
                    className={`w-12 h-12 ${isActive ? "text-primary animate-pulse" : "text-gray-400"}`}
                    onClick={() => onSelectTrack(index)}
                  />
                </div>
                <button
                  className="text-sm font-medium text-center mb-3 hover:text-primary transition-colors line-clamp-2"
                  onClick={() => onSelectTrack(index)}
                >
                  {track.name}
                </button>
                <div className="flex justify-center gap-2">
                  {onEditTrack && !track.isPrebuilt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:text-blue-700"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                    onClick={() => onRemoveTrack(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleEdit = (index: number) => {
    if (tracks && tracks[index]) {
      setEditingTrack({
        index,
        data: {
          url: tracks[index].url,
          name: tracks[index].name
        }
      });
    }
  };

  const handleSaveEdit = (data: { url: string; name: string }) => {
    if (editingTrack !== null && onEditTrack) {
      onEditTrack(editingTrack.index, data);
    }
    setEditingTrack(null);
  };

  return (
    <ScrollArea className={`h-[${isMobile ? "200px" : "500px"}] pr-4`}>
      {renderStationsList(userStations, "My Stations")}
      {renderStationsList(prebuiltStations, "Prebuilt Stations")}
      {editingTrack && (
        <EditStationDialog
          isOpen={editingTrack !== null}
          onClose={() => setEditingTrack(null)}
          onSave={handleSaveEdit}
          initialValues={editingTrack.data}
        />
      )}
    </ScrollArea>
  );
};

export default Playlist;
