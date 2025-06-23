
import React from 'react';
import { Play, Pause, Heart, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Track } from '../../core/TrackManager';
import { usePlayer } from '../../contexts/PlayerContext';

interface StationListProps {
  stations: Track[];
  title: string;
  emptyMessage: string;
  showEdit?: boolean;
  onEdit?: (station: Track) => void;
  onDelete?: (station: Track) => void;
}

export const StationList: React.FC<StationListProps> = ({
  stations,
  title,
  emptyMessage,
  showEdit = false,
  onEdit,
  onDelete,
}) => {
  const {
    audioState,
    play,
    pause,
    toggleFavorite,
    addToPlaylist,
    isInPlaylist,
  } = usePlayer();

  const { currentTrack, isPlaying } = audioState;

  const handlePlayPause = async (station: Track) => {
    if (currentTrack?.id === station.id) {
      if (isPlaying) {
        pause();
      } else {
        await play();
      }
    } else {
      await play(station);
    }
  };

  if (stations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="space-y-2">
        {stations.map((station) => {
          const isCurrentTrack = currentTrack?.id === station.id;
          const isCurrentlyPlaying = isCurrentTrack && isPlaying;

          return (
            <Card key={station.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayPause(station)}
                    className={isCurrentTrack ? 'text-primary' : ''}
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${isCurrentTrack ? 'text-primary' : ''}`}>
                      {station.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {station.language && (
                        <Badge variant="secondary" className="text-xs">
                          {station.language}
                        </Badge>
                      )}
                      {station.isFeatured && (
                        <Badge variant="outline" className="text-xs">
                          Featured
                        </Badge>
                      )}
                      {station.playTime && station.playTime > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(station.playTime / 60)}m played
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(station.id)}
                    className={station.isFavorite ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${station.isFavorite ? 'fill-current' : ''}`} />
                  </Button>

                  {!isInPlaylist(station.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => addToPlaylist(station)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}

                  {showEdit && onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(station)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {showEdit && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(station)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
