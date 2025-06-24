
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive, getResponsiveColumns, getResponsiveSpacing } from '@/utils/responsive';
import { Track } from '@/types/track';
import { StationCard } from '@/components/ui/player/StationCard';
import { EnhancedLoadingSpinner } from '@/components/ui/loading/EnhancedLoadingSpinner';
import { fadeInUp } from '@/utils/animations';

interface EnhancedStationGridProps {
  stations: Track[];
  currentTrack?: Track | null;
  isPlaying?: boolean;
  onStationPlay: (index: number) => void;
  onStationEdit?: (station: Track) => void;
  onStationDelete?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  context?: 'library' | 'playlist';
  loading?: boolean;
  className?: string;
  itemsPerPage?: number;
  enableVirtualization?: boolean;
}

export const EnhancedStationGrid: React.FC<EnhancedStationGridProps> = ({
  stations,
  currentTrack,
  isPlaying = false,
  onStationPlay,
  onStationEdit,
  onStationDelete,
  onToggleFavorite,
  context = 'library',
  loading = false,
  className,
  itemsPerPage,
  enableVirtualization = false
}) => {
  const { screenSize, isMobile } = useResponsive();
  
  const columns = getResponsiveColumns(screenSize);
  const spacing = getResponsiveSpacing(screenSize);

  // Optimize rendering for large lists
  const displayedStations = useMemo(() => {
    if (!itemsPerPage) return stations;
    return stations.slice(0, itemsPerPage);
  }, [stations, itemsPerPage]);

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <EnhancedLoadingSpinner
          size="lg"
          text="Loading stations..."
          className="py-12"
        />
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}>
        <div className="text-muted-foreground mb-2">No stations found</div>
        <div className="text-sm text-muted-foreground">
          Try adjusting your search or add some stations to get started
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid w-full auto-rows-fr',
        spacing,
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {displayedStations.map((station, index) => {
        const isSelected = currentTrack?.url === station.url;
        
        return (
          <div
            key={station.url}
            className="group"
            style={{
              animation: `${fadeInUp.transition.duration}s ease-out ${index * 0.05}s both`,
              animationName: 'fadeInUp'
            }}
          >
            <StationCard
              station={station}
              isPlaying={isPlaying && isSelected}
              isSelected={isSelected}
              onPlay={() => onStationPlay(index)}
              onEdit={() => onStationEdit?.(station)}
              onDelete={() => onStationDelete?.(station)}
              onToggleFavorite={() => onToggleFavorite?.(station)}
              context={context}
            />
          </div>
        );
      })}
    </div>
  );
};
