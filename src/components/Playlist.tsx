
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Heart, HeartOff, Play, Pause, Sparkles, MoreVertical, Music } from "lucide-react";
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
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    setEditingTrack({ index, track: tracks[index] });
    setExpandedCard(null);
  };

  const handleEditSave = (data: { url: string; name: string; language?: string }) => {
    if (editingTrack) {
      onEdit(editingTrack.index, data);
      setEditingTrack(null);
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-accent flex items-center justify-center">
          <Music className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-on-surface mb-2">No stations yet</h3>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Your playlist is empty. Add some radio stations to start listening to your favorite music!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Modern Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Your Playlist</h2>
            <p className="text-on-surface-variant mt-1">
              {tracks.length} station{tracks.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          
          {tracks.length > 0 && (
            <Button
              variant="ghost"
              onClick={onClearAll}
              className="group relative overflow-hidden bg-red-50/80 dark:bg-red-950/20 hover:bg-red-100/90 dark:hover:bg-red-900/30 border border-red-200/60 dark:border-red-800/40 text-red-700 dark:text-red-400 rounded-2xl px-6 py-3 transition-smooth elevation-1 hover:elevation-2"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Sparkles className="h-4 w-4 absolute opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
                  <Trash2 className="h-4 w-4 group-hover:opacity-0 transition-opacity" />
                </div>
                <span className="font-semibold">Clear All</span>
              </div>
            </Button>
          )}
        </div>

        {/* Modern Track Grid */}
        <div className="grid gap-4 md:gap-6">
          {tracks.map((track, index) => (
            <Card
              key={`${track.url}-${index}`}
              className={cn(
                "group relative overflow-hidden transition-smooth cursor-pointer border-0 elevation-1 hover:elevation-3",
                "bg-gradient-to-r from-surface/80 to-surface-container/60 backdrop-blur-sm",
                index === currentIndex && isPlaying
                  ? "ring-2 ring-primary/30 bg-gradient-to-r from-primary/5 to-tertiary/5"
                  : "hover:from-surface-container/80 hover:to-surface-container-high/60"
              )}
              onClick={() => onPlay(index)}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-tertiary/20" />
              </div>

              <div className="relative p-6">
                <div className="flex items-center gap-4">
                  {/* Play/Pause Button */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-smooth",
                      index === currentIndex && isPlaying
                        ? "bg-primary text-on-primary shadow-lg"
                        : "bg-surface-container-high/60 text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary"
                    )}>
                      {index === currentIndex && isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold text-lg text-on-surface truncate mb-1">
                      {track.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant truncate mb-2">
                      {track.url}
                    </p>
                    {track.language && (
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                        {track.language}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(index);
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-surface-container-high/60 transition-smooth"
                    >
                      {track.isFavorite ? (
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      ) : (
                        <HeartOff className="h-4 w-4 text-on-surface-variant hover:text-red-500" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(index);
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-surface-container-high/60 transition-smooth"
                    >
                      <Edit className="h-4 w-4 text-on-surface-variant hover:text-primary" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-surface-container-high/60 text-on-surface-variant hover:text-red-500 transition-smooth"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(expandedCard === index ? null : index);
                      }}
                      className="h-10 w-10 rounded-xl"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Expanded Actions */}
                {expandedCard === index && (
                  <div className="md:hidden mt-4 pt-4 border-t border-outline-variant/20">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(index);
                          setExpandedCard(null);
                        }}
                        className="flex-1 gap-2 rounded-xl"
                      >
                        {track.isFavorite ? (
                          <>
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            Unfavorite
                          </>
                        ) : (
                          <>
                            <HeartOff className="h-4 w-4" />
                            Favorite
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(index);
                        }}
                        className="flex-1 gap-2 rounded-xl"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(index);
                          setExpandedCard(null);
                        }}
                        className="flex-1 gap-2 text-red-500 hover:text-red-600 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
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
