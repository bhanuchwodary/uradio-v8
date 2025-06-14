
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Heart, HeartOff, Play, Pause, Sparkles } from "lucide-react";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";
import EditStationDialog from "@/components/EditStationDialog";

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
        {/* Header with responsive Clear All button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Your Playlist ({tracks.length})</h2>
          {tracks.length > 0 && (
            <>
              {/* Mobile version - Icon only */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClearAll}
                className="md:hidden group relative overflow-hidden bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-950/40 dark:to-red-900/20 hover:from-red-100/90 hover:to-red-200/70 dark:hover:from-red-900/60 dark:hover:to-red-800/40 border border-red-200/60 dark:border-red-800/40 hover:border-red-300/80 dark:hover:border-red-700/60 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-all duration-300 rounded-xl h-10 w-10 shadow-sm hover:shadow-lg backdrop-blur-sm"
                title="Clear Playlist"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl" />
                <div className="relative">
                  <div className="relative">
                    <Sparkles className="h-4 w-4 transition-all group-hover:scale-110 duration-300 absolute opacity-0 group-hover:opacity-100 animate-pulse" />
                    <Trash2 className="h-4 w-4 transition-all group-hover:scale-95 group-hover:opacity-0 duration-300" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400/20 rounded-full group-hover:scale-150 transition-transform duration-300" />
              </Button>

              {/* Desktop version - Full button with text */}
              <Button
                variant="ghost"
                onClick={onClearAll}
                className="hidden md:flex group relative overflow-hidden bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-950/40 dark:to-red-900/20 hover:from-red-100/90 hover:to-red-200/70 dark:hover:from-red-900/60 dark:hover:to-red-800/40 border border-red-200/60 dark:border-red-800/40 hover:border-red-300/80 dark:hover:border-red-700/60 text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 transition-all duration-300 rounded-2xl px-6 py-2.5 shadow-sm hover:shadow-lg backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl" />
                <div className="relative flex items-center gap-2.5">
                  <div className="relative">
                    <Sparkles className="h-4 w-4 transition-all group-hover:scale-110 duration-300 absolute opacity-0 group-hover:opacity-100 animate-pulse" />
                    <Trash2 className="h-4 w-4 transition-all group-hover:scale-95 group-hover:opacity-0 duration-300" />
                  </div>
                  <span className="font-semibold text-sm tracking-wide">Clear Playlist</span>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400/20 rounded-full group-hover:scale-150 transition-transform duration-300" />
              </Button>
            </>
          )}
        </div>

        {/* Track list */}
        {tracks.map((track, index) => (
          <Card
            key={`${track.url}-${index}`}
            className={cn(
              "p-3 transition-all duration-200 hover:bg-surface-container-high/60 cursor-pointer border-outline-variant/30 rounded-xl",
              index === currentIndex && isPlaying
                ? "bg-primary-container/20 border-primary/30 shadow-sm"
                : "bg-surface-container/40 hover:shadow-sm"
            )}
            onClick={() => onPlay(index)}
          >
            <div className="flex items-center gap-3">
              {/* Play/Pause indicator */}
              <div className="flex-shrink-0">
                {index === currentIndex && isPlaying ? (
                  <Pause className="h-4 w-4 text-primary" />
                ) : (
                  <Play className="h-4 w-4 text-on-surface-variant" />
                )}
              </div>

              {/* Track info */}
              <div className="flex-grow min-w-0">
                <h3 className="font-medium text-sm text-on-surface truncate leading-tight">{track.name}</h3>
                <p className="text-xs text-on-surface-variant truncate leading-tight mt-0.5">
                  {track.url}
                </p>
                {track.language && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                    {track.language}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(index);
                  }}
                  className="h-7 w-7 hover:bg-surface-container-high/60 rounded-lg transition-all"
                >
                  {track.isFavorite ? (
                    <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                  ) : (
                    <HeartOff className="h-3.5 w-3.5 text-on-surface-variant" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(index);
                  }}
                  className="h-7 w-7 hover:bg-surface-container-high/60 rounded-lg transition-all"
                >
                  <Edit className="h-3.5 w-3.5 text-on-surface-variant" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="h-7 w-7 hover:bg-surface-container-high/60 text-on-surface-variant hover:text-destructive rounded-lg transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingTrack && (
        <EditStationDialog
          isOpen={true}
          onClose={() => setEditingTrack(null)}
          onSave={handleEditSave}
          initialValues={{
            url: editingTrack.track.url,
            name: editingTrack.track.name,
            language: editingTrack.track.language
          }}
        />
      )}
    </>
  );
};

export default Playlist;
