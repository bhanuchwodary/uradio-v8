
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { usePlayer } from '../../contexts/PlayerContext';

export const MainPlayer: React.FC = () => {
  const {
    audioState,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    seek,
    toggleFavorite,
    addToPlaylist,
    isInPlaylist,
  } = usePlayer();

  const { currentTrack, isPlaying, currentTime, duration, volume, loading } = audioState;

  const formatTime = (time: number): string => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Select a station to start playing</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      {/* Track Info */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold truncate">{currentTrack.name}</h2>
        {currentTrack.language && (
          <span className="inline-block px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
            {currentTrack.language}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {duration && duration !== Infinity && (
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={([value]) => seek(value)}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousTrack}
          className="h-10 w-10"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          onClick={togglePlayPause}
          disabled={loading}
          className="h-12 w-12"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextTrack}
          className="h-10 w-10"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(currentTrack.id)}
            className={currentTrack.isFavorite ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 ${currentTrack.isFavorite ? 'fill-current' : ''}`} />
          </Button>

          {!isInPlaylist(currentTrack.id) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => addToPlaylist(currentTrack)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 w-32">
          <Volume2 className="h-4 w-4" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([value]) => setVolume(value / 100)}
            className="flex-1"
          />
        </div>
      </div>
    </Card>
  );
};
