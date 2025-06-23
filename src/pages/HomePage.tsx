
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainPlayer } from '../components/Player/MainPlayer';
import { StationList } from '../components/Stations/StationList';
import { usePlayer } from '../contexts/PlayerContext';
import { Track } from '../core/TrackManager';

export const HomePage: React.FC = () => {
  const { tracks, favorites } = usePlayer();
  const [editingStation, setEditingStation] = useState<Track | null>(null);

  const featuredStations = tracks.filter(track => track.isFeatured);
  const userStations = tracks.filter(track => !track.isFeatured);
  const popularStations = [...tracks]
    .sort((a, b) => (b.playTime || 0) - (a.playTime || 0))
    .slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
      <MainPlayer />
      
      {favorites.length > 0 && (
        <StationList
          stations={favorites}
          title="Your Favorites"
          emptyMessage="No favorite stations yet"
        />
      )}

      <Tabs defaultValue="featured" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="your-stations">Your Stations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="featured">
          <StationList
            stations={featuredStations}
            title="Featured Stations"
            emptyMessage="No featured stations available"
          />
        </TabsContent>
        
        <TabsContent value="popular">
          <StationList
            stations={popularStations}
            title="Most Played"
            emptyMessage="No listening history yet"
          />
        </TabsContent>
        
        <TabsContent value="your-stations">
          <StationList
            stations={userStations}
            title="Your Stations"
            emptyMessage="No custom stations yet. Add some!"
            showEdit={true}
            onEdit={setEditingStation}
            onDelete={(station) => {
              // Handle delete with confirmation
              if (confirm(`Remove "${station.name}" from your stations?`)) {
                // removeTrack(station.id);
              }
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
