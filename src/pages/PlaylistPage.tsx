
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StationList } from '../components/Stations/StationList';
import { usePlayer } from '../contexts/PlayerContext';

export const PlaylistPage: React.FC = () => {
  const { playlist, clearPlaylist } = usePlayer();

  const handleClearPlaylist = () => {
    if (confirm(`Remove all ${playlist.length} stations from your playlist?`)) {
      clearPlaylist();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Playlist</h1>
        {playlist.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearPlaylist}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {playlist.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Your playlist is empty</h3>
          <p className="text-muted-foreground">
            Add stations to your playlist by clicking the + button next to any station
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {playlist.length} station{playlist.length !== 1 ? 's' : ''} in your playlist
          </p>
          <StationList
            stations={playlist}
            title=""
            emptyMessage="No stations in playlist"
          />
        </div>
      )}
    </div>
  );
};
