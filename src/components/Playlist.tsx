import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Heart, Edit } from "lucide-react";
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
  onToggleFavorite?: (index: number) => void;
  onEditTrack?: (index: number, data: { url: string; name: string }) => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  urls,
  tracks,
  currentIndex,
  onSelectTrack,
  onRemoveTrack,
  onToggleFavorite,
  onEditTrack,
}) => {
  const [editingTrack, setEditingTrack] = useState<{ index: number; data: { url: string; name: string } } | null>(null);
  const isMobile = useIsMobile();
  
  const scrollAreaHeight = isMobile ? "200px" : "250px";

  if (urls.length === 0) {
    return (
      <div className="text-center p-3 text-gray-500">
        No tracks added. Add a URL to get started.
      </div>
    );
  }

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

  const getDisplayUrl = (url: string): string => {
    if (!url) return "No URL";
    
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop() || url;
    } catch (e) {
      return url;
    }
  };

  return (
    <ScrollArea className={`h-[${scrollAreaHeight}] pr-4`}>
      <div className="space-y-2">
        {tracks ? (
          tracks.map((track, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-md ${
                  isActive
                    ? "bg-primary/20 backdrop-blur-sm"
                    : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    className="truncate text-sm text-left hover:text-primary transition-colors flex-1"
                    onClick={() => onSelectTrack(index)}
                  >
                    {isMobile ? track.name : `${index + 1}. ${track.name}`}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {onToggleFavorite && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 ${track.isFavorite ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
                      onClick={() => onToggleFavorite(index)}
                    >
                      <Heart className="h-4 w-4" fill={track.isFavorite ? "currentColor" : "none"} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onSelectTrack(index)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  {onEditTrack && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-blue-500 hover:text-blue-700"
                      onClick={() => handleEdit(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={() => onRemoveTrack(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          urls.map((url, index) => {
            const isActive = index === currentIndex;
            const displayUrl = getDisplayUrl(url);

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-md ${
                  isActive
                    ? "bg-primary/20 backdrop-blur-sm"
                    : "bg-white/10 backdrop-blur-sm hover:bg-white/20"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    className="truncate text-sm text-left hover:text-primary transition-colors flex-1"
                    onClick={() => onSelectTrack(index)}
                  >
                    {isMobile ? displayUrl : `${index + 1}. ${displayUrl}`}
                  </button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-red-700"
                  onClick={() => onRemoveTrack(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
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
