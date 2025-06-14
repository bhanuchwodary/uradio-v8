
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Heart, Play, Pause, MoreHorizontal, ListX, Sparkles } from "lucide-react";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";
import EditStationDialog from "@/components/EditStationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <div className="text-center py-16 flex flex-col items-center justify-center">
        <Sparkles className="h-12 w-12 text-primary/40 mb-4" />
        <h3 className="text-lg font-semibold text-on-surface">Your Playlist is Empty</h3>
        <p className="text-on-surface-variant/70 mt-2 max-w-xs">
          Use the 'Add' tab to add your favorite radio stations and start listening.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {/* Header with redesigned Clear All button */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-bold text-on-surface">Playlist ({tracks.length})</h2>
          {tracks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-on-surface-variant hover:text-destructive hover:bg-destructive/10"
            >
              <ListX className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Track list */}
        <div className="space-y-2.5">
          {tracks.map((track, index) => (
            <div
              key={`${track.url}-${index}`}
              className={cn(
                "flex items-center p-2.5 transition-all duration-300 rounded-2xl cursor-pointer group relative animate-slide-up",
                index === currentIndex && isPlaying
                  ? "bg-primary-container/60"
                  : "bg-surface-container hover:bg-surface-container-high"
              )}
              style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
              onClick={() => onPlay(index)}
            >
              {/* Playing indicator bar */}
              {index === currentIndex && isPlaying && (
                <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-primary rounded-r-full"></div>
              )}
              
              <div className="pl-3 flex-grow min-w-0 flex items-center gap-4">
                <div className="flex-shrink-0 text-on-surface-variant">
                  {index === currentIndex && isPlaying ? (
                    <Pause className="h-5 w-5 text-primary" />
                  ) : (
                    <Play className="h-5 w-5 group-hover:text-on-surface" />
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-medium text-on-surface truncate">{track.name}</h3>
                  {track.language && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-md font-medium">
                      {track.language}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0 pr-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(index); }}
                  className="h-9 w-9 rounded-full hover:bg-surface-container-highest"
                  title={track.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {track.isFavorite ? (
                    <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                  ) : (
                    <Heart className="h-4 w-4 text-on-surface-variant/70 group-hover:text-red-400" />
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-9 w-9 rounded-full hover:bg-surface-container-highest text-on-surface-variant"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end" className="bg-surface-container-high rounded-xl">
                    <DropdownMenuItem onClick={() => handleEdit(index)} className="rounded-lg m-1">
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRemove(index)} className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg m-1">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Remove</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
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
