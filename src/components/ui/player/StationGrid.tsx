
import React, { memo, useMemo } from "react";
import { Track } from "@/types/track";
import { EnhancedStationCard } from "./EnhancedStationCard";
import { EnhancedStationGridSkeleton } from "@/components/ui/skeleton/EnhancedStationGridSkeleton";
import { NoStationsEmptyState, NoSearchResultsEmptyState } from "@/components/ui/empty-states/StationEmptyStates";
import { logger } from "@/utils/logger";

interface StationGridProps {
  stations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number) => void;
  onEditStation?: (station: Track) => void;
  onDeleteStation?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  actionIcon?: "play" | "add";
  context?: "playlist" | "library";
  loading?: boolean;
  isInPlaylist?: (trackUrl: string) => boolean;
  isAddingToPlaylist?: boolean;
  searchQuery?: string;
  showFeatured?: boolean;
  variant?: "default" | "featured" | "compact";
}

export const StationGrid: React.FC<StationGridProps> = memo(({
  stations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite,
  actionIcon = "play",
  context = "library",
  loading = false,
  isInPlaylist,
  isAddingToPlaylist = false,
  searchQuery,
  showFeatured = false,
  variant = "default"
}) => {
  // Memoize station keys to prevent unnecessary re-renders
  const stationKeys = useMemo(() => 
    stations.map(station => `${station.url}-${station.name}-${station.language || 'unknown'}`),
    [stations]
  );

  // Show loading skeleton
  if (loading) {
    return (
      <EnhancedStationGridSkeleton 
        count={12} 
        variant={variant}
        showFeatured={showFeatured}
      />
    );
  }

  // Show empty state
  if (!stations || stations.length === 0) {
    if (searchQuery) {
      return <NoSearchResultsEmptyState searchQuery={searchQuery} />;
    }
    return <NoStationsEmptyState />;
  }

  // Separate featured and regular stations for better layout
  const featuredStations = useMemo(() => 
    showFeatured ? stations.filter(station => station.isFeatured).slice(0, 2) : [],
    [stations, showFeatured]
  );

  const regularStations = useMemo(() => 
    showFeatured ? stations.filter(station => !station.isFeatured) : stations,
    [stations, showFeatured]
  );

  return (
    <div className="space-y-6">
      {/* Featured Stations - Larger Cards */}
      {featuredStations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Featured Stations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featuredStations.map((station, index) => {
              const stationIndex = stations.findIndex(s => s.url === station.url);
              const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
              const isSelected = station.url === currentTrackUrl;
              const inPlaylist = isInPlaylist ? isInPlaylist(station.url) : false;
              
              return (
                <EnhancedStationCard
                  key={`featured-${station.url}`}
                  station={station}
                  isPlaying={isCurrentlyPlaying}
                  isSelected={isSelected}
                  onPlay={() => onSelectStation(stationIndex)}
                  onEdit={onEditStation ? () => onEditStation(station) : undefined}
                  onDelete={onDeleteStation ? () => onDeleteStation(station) : undefined}
                  onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(station) : undefined}
                  actionIcon={actionIcon}
                  context={context}
                  inPlaylist={inPlaylist}
                  isAddingToPlaylist={isAddingToPlaylist}
                  variant="featured"
                  showStats={true}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Regular Stations Grid */}
      {regularStations.length > 0 && (
        <div className="space-y-3">
          {featuredStations.length > 0 && (
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              All Stations
            </h3>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
            {regularStations.map((station, index) => {
              const stationIndex = stations.findIndex(s => s.url === station.url);
              const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
              const isSelected = station.url === currentTrackUrl;
              const stationKey = stationKeys[stationIndex];
              const inPlaylist = isInPlaylist ? isInPlaylist(station.url) : false;
              
              // Only log in development
              if (process.env.NODE_ENV === 'development') {
                logger.debug("Rendering station in enhanced grid", { 
                  name: station.name, 
                  language: station.language,
                  key: stationKey,
                  isSelected,
                  isPlaying: isCurrentlyPlaying,
                  context,
                  inPlaylist,
                  isAddingToPlaylist
                });
              }
              
              return (
                <EnhancedStationCard
                  key={stationKey}
                  station={station}
                  isPlaying={isCurrentlyPlaying}
                  isSelected={isSelected}
                  onPlay={() => onSelectStation(stationIndex)}
                  onEdit={onEditStation ? () => onEditStation(station) : undefined}
                  onDelete={onDeleteStation ? () => onDeleteStation(station) : undefined}
                  onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(station) : undefined}
                  actionIcon={actionIcon}
                  context={context}
                  inPlaylist={inPlaylist}
                  isAddingToPlaylist={isAddingToPlaylist}
                  variant={variant}
                  priority={station.isFavorite ? "high" : "medium"}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison for better performance
  if (prevProps.loading !== nextProps.loading) return false;
  if (prevProps.stations.length !== nextProps.stations.length) return false;
  if (prevProps.currentTrackUrl !== nextProps.currentTrackUrl) return false;
  if (prevProps.isPlaying !== nextProps.isPlaying) return false;
  if (prevProps.context !== nextProps.context) return false;
  if (prevProps.isAddingToPlaylist !== nextProps.isAddingToPlaylist) return false;
  if (prevProps.searchQuery !== nextProps.searchQuery) return false;
  if (prevProps.showFeatured !== nextProps.showFeatured) return false;
  if (prevProps.variant !== nextProps.variant) return false;
  
  // Deep comparison only when necessary
  return prevProps.stations.every((station, index) => {
    const nextStation = nextProps.stations[index];
    return nextStation &&
      station.url === nextStation.url &&
      station.name === nextStation.name &&
      station.isFavorite === nextStation.isFavorite &&
      station.language === nextStation.language;
  });
});

StationGrid.displayName = "StationGrid";
