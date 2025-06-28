
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Track } from "@/types/track";
import { StationGrid } from "@/components/ui/player/StationGrid";
import { NoStationsEmptyState, NoFeaturedStationsEmptyState } from "@/components/ui/empty-states/StationEmptyStates";
import { TrendingUp, User, Star, Music } from "lucide-react";

interface StationsTabsSectionProps {
  popularStations: Track[];
  userStations: Track[];
  featuredStations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (stationIndex: number, stationList: Track[]) => void;
  onEditStation: (station: Track) => void;
  onDeleteStation: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
}

const StationsTabsSection: React.FC<StationsTabsSectionProps> = ({
  popularStations,
  userStations,
  featuredStations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState("featured");

  const TabHeader: React.FC<{ 
    icon: React.ComponentType<{ className?: string }>, 
    title: string, 
    count: number 
  }> = ({ icon: Icon, title, count }) => (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{title}</span>
      <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Music className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">All Stations</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/30 p-1">
          <TabsTrigger value="featured" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TabHeader icon={Star} title="Featured" count={featuredStations.length} />
          </TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TabHeader icon={TrendingUp} title="Popular" count={popularStations.length} />
          </TabsTrigger>
          <TabsTrigger value="my-stations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TabHeader icon={User} title="My Stations" count={userStations.length} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-0">
          {featuredStations.length === 0 ? (
            <NoFeaturedStationsEmptyState />
          ) : (
            <StationGrid
              stations={featuredStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrackUrl}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, featuredStations)}
              onToggleFavorite={onToggleFavorite}
              context="library"
              showFeatured={true}
              variant="default"
            />
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-0">
          {popularStations.length === 0 ? (
            <NoStationsEmptyState />
          ) : (
            <StationGrid
              stations={popularStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrackUrl}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, popularStations)}
              onEditStation={onEditStation}
              onDeleteStation={onDeleteStation}
              onToggleFavorite={onToggleFavorite}
              context="library"
              variant="large"
              showFeatured={false}
            />
          )}
        </TabsContent>

        <TabsContent value="my-stations" className="mt-0">
          {userStations.length === 0 ? (
            <NoStationsEmptyState />
          ) : (
            <StationGrid
              stations={userStations}
              currentIndex={currentIndex}
              currentTrackUrl={currentTrackUrl}
              isPlaying={isPlaying}
              onSelectStation={(index) => onSelectStation(index, userStations)}
              onEditStation={onEditStation}
              onDeleteStation={onDeleteStation}
              onToggleFavorite={onToggleFavorite}
              context="library"
              variant="default"
              showFeatured={false}
            />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default StationsTabsSection;
