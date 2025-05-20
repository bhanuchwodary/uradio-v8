import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Radio, Edit, Trash2, Globe } from "lucide-react";
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
  onEditTrack?: (index: number, data: { url: string; name: string; language?: string }) => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  urls,
  tracks = [],
  currentIndex,
  onSelectTrack,
  onRemoveTrack,
  onEditTrack,
}) => {
  const [editingTrack, setEditingTrack] = useState<{ index: number; data: { url: string; name: string; language?: string } } | null>(null);
  const [renderKey, setRenderKey] = useState(Date.now());
  const mountTime = useMemo(() => Date.now(), []);
  const isMobile = useIsMobile();

  // Force re-render only when tracks length changes or when tracks content genuinely changes
  useEffect(() => {
    const tracksSignature = JSON.stringify(
      tracks.map(t => ({ url: t.url, name: t.name, isPrebuilt: t.isPrebuilt }))
    );
    setRenderKey(prev => {
      // Only update if something meaningful changed
      const newKey = Date.now();
      return newKey !== prev ? newKey : prev;
    });
  }, [tracks.length, JSON.stringify(tracks)]);

  // Memoize the filtered tracks to prevent unnecessary re-rendering
  const { userStations, prebuiltStations } = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Recomputing stations with ${tracks.length} tracks`);
    }
    
    const user = tracks.filter(track => !track.isPrebuilt);
    const prebuilt = tracks.filter(track => track.isPrebuilt === true);
    
    return { userStations: user, prebuiltStations: prebuilt };
  }, [tracks]);

  // Handle edit with useCallback for better performance
  const handleEdit = useCallback((index: number) => {
    if (tracks && tracks[index]) {
      setEditingTrack({
        index,
        data: {
          url: tracks[index].url,
          name: tracks[index].name,
          language: tracks[index].language
        }
      });
    }
  }, [tracks]);

  // Handle save with useCallback
  const handleSaveEdit = useCallback((data: { url: string; name: string; language?: string }) => {
    if (editingTrack !== null && onEditTrack) {
      onEditTrack(editingTrack.index, data);
    }
    setEditingTrack(null);
  }, [editingTrack, onEditTrack]);

  // We'll keep this check to handle empty playlists gracefully
  if (!tracks || tracks.length === 0) {
    return (
      <div className="text-center p-3 text-gray-500">
        No stations added. Add a URL to get started.
      </div>
    );
  }

  // Memoized renderStationsList to prevent unnecessary recalculations
  const renderStationsList = (stationsList: Track[], title: string) => {
    if (stationsList.length === 0) return null;

    const uniqueKey = `${title}-${renderKey}-${mountTime}-${stationsList.length}`;

    // Group stations by language
    const stationsByLanguage: Record<string, Track[]> = {};
    
    stationsList.forEach(station => {
      const language = station.language || "Unknown";
      if (!stationsByLanguage[language]) {
        stationsByLanguage[language] = [];
      }
      stationsByLanguage[language].push(station);
    });

    return (
      <div className="space-y-4 mb-6" key={uniqueKey}>
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        
        {Object.entries(stationsByLanguage).map(([language, stations]) => (
          <div key={`${language}-${uniqueKey}`} className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Globe className="h-4 w-4" />
              <h4 className="text-md font-medium text-foreground">{language}</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stations.map((station) => {
                // Find the original index in the full tracks array with a more reliable method
                const index = tracks.findIndex(t => 
                  t.url === station.url && 
                  t.name === station.name &&
                  t.isPrebuilt === station.isPrebuilt
                );
                
                if (index === -1) {
                  return null;
                }
                
                const isActive = index === currentIndex;
                // Create a truly unique key for this card
                const cardKey = `${station.url}-${station.name}-${isActive}-${renderKey}`;
                
                return (
                  <div
                    key={cardKey}
                    className={`flex flex-col p-4 rounded-lg ${
                      isActive
                        ? "bg-primary/20 backdrop-blur-sm material-shadow-2"
                        : "bg-white/10 backdrop-blur-sm hover:bg-white/20 material-shadow-1 hover:material-shadow-2 material-transition"
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      <Radio
                        className={`w-12 h-12 ${isActive ? "text-primary animate-pulse" : "text-gray-400"}`}
                        onClick={() => onSelectTrack(index)}
                      />
                    </div>
                    <button
                      className="text-sm font-medium text-center mb-3 hover:text-primary transition-colors line-clamp-2 text-foreground"
                      onClick={() => onSelectTrack(index)}
                    >
                      {station.name}
                    </button>
                    <div className="flex justify-center gap-2">
                      {onEditTrack && !station.isPrebuilt && (
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
        ))}
      </div>
    );
  };

  const scrollHeight = isMobile ? "300px" : "500px";

  return (
    <ScrollArea className={`h-[${scrollHeight}] pr-4`}>
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
