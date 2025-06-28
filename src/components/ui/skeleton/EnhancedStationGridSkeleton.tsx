
import React from "react";
import { StationCardSkeleton } from "./StationCardSkeleton";

interface EnhancedStationGridSkeletonProps {
  count?: number;
  variant?: "default" | "featured" | "compact" | "large";
  showFeatured?: boolean;
}

export const EnhancedStationGridSkeleton: React.FC<EnhancedStationGridSkeletonProps> = ({
  count = 12,
  variant = "default",
  showFeatured = false
}) => {
  const featuredCount = showFeatured ? 2 : 0;
  const regularCount = count - featuredCount;

  return (
    <div className="space-y-6">
      {/* Featured Stations Skeleton */}
      {showFeatured && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: featuredCount }).map((_, index) => (
              <StationCardSkeleton key={`featured-${index}`} variant="featured" />
            ))}
          </div>
        </div>
      )}

      {/* Regular Stations Grid Skeleton */}
      {regularCount > 0 && (
        <div className="space-y-3">
          {showFeatured && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-4">
            {Array.from({ length: regularCount }).map((_, index) => (
              <StationCardSkeleton key={`regular-${index}`} variant={variant} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
