
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Heart, HeartOff, Play, Pause } from "lucide-react";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";
import { EditStationDialog } from "@/components/EditStationDialog";

interface PlaylistProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onPlay: (index: number) => void;
  onRemove: (index: number) => void;
  onToggleFavorite: (index: number) => void;
  onEdit: (index: number, data: { url: string; name: string; language?: string }) => void;
  onClearAll: () => void;
}

const Playlist: React.FC<PlaylistProps> = ({
  tracks,
  currentIndex,
  isPlaying,
  onPlay,
  onRemove,
  onToggleFavorite,
  onEdit,
  onClearAll,
}) => {
  const [editingTrack, setEditingTrack] = useState<{ index: number; track: Track } | null>(null);

  const handleEdit = (index: number) => {
    setEditingTrack({ index, track: tracks[index] });
  };

  const handleEditSave = (data: { url: string; name: string; language?: string }) => {
    if (editingTrack) {
      onEdit(editingTrack.index, data);
      setEditingTrack(null);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-on-surface-variant">No stations in your playlist yet.</p>
        <p className="text-sm text-on-surface-variant/70 mt-2">
          Add some stations to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Header with Clear All button using app theme */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Your Playlist ({tracks.length})</h2>
          {tracks.length > 0 && (
            <Button
              variant="ghost"
              onClick={onClearAll}
              className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 active:bg-primary-container/20 transition-all duration-200 ease-out rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Track list */}
        {tracks.map((track, index) => (
          <Card
            key={`${track.url}-${index}`}
            className={cn(
              "p-4 transition-all duration-200 hover:bg-surface-container-high/60 cursor-pointer border-outline-variant/30",
              index === currentIndex && isPlaying
                ? "bg-primary-container/20 border-primary/30"
                : "bg-surface-container/40"
            )}
            onClick={() => onPlay(index)}
          >
            <div className="flex items-center gap-3">
              {/* Play/Pause indicator */}
              <div className="flex-shrink-0">
                {index === currentIndex && isPlaying ? (
                  <Pause className="h-5 w-5 text-primary" />
                ) : (
                  <Play className="h-5 w-5 text-on-surface-variant" />
                )}
              </div>

              {/* Track info */}
              <div className="flex-grow min-w-0">
                <h3 className="font-medium text-on-surface truncate">{track.name}</h3>
                <p className="text-sm text-on-surface-variant truncate">
                  {track.url}
                </p>
                {track.language && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                    {track.language}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(index);
                  }}
                  className="h-8 w-8 hover:bg-surface-container-high/60"
                >
                  {track.isFavorite ? (
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  ) : (
                    <HeartOff className="h-4 w-4 text-on-surface-variant" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(index);
                  }}
                  className="h-8 w-8 hover:bg-surface-container-high/60"
                >
                  <Edit className="h-4 w-4 text-on-surface-variant" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="h-8 w-8 hover:bg-surface-container-high/60 text-on-surface-variant hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingTrack && (
        <EditStationDialog
          station={editingTrack.track}
          isOpen={true}
          onClose={() => setEditingTrack(null)}
          onSave={handleEditSave}
        />
      )}
    </>
  );
};

export default Playlist;
