
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EnhancedStationGridSkeletonProps {
  count?: number;
  variant?: "default" | "featured" | "compact";
  showFeatured?: boolean;
}

export const EnhancedStationGridSkeleton: React.FC<EnhancedStationGridSkeletonProps> = ({
  count = 12,
  variant = "default",
  showFeatured = true
}) => {
  const getSkeletonHeight = () => {
    switch (variant) {
      case "featured": return "h-32";
      case "compact": return "h-20";
      default: return "h-24";
    }
  };

  const featuredItems = showFeatured ? 2 : 0;
  const regularItems = count - featuredItems;

  return (
    <div className="space-y-4">
      {/* Featured Items */}
      {showFeatured && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: featuredItems }).map((_, index) => (
            <div
              key={`featured-${index}`}
              className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border p-4"
            >
              <div className="flex items-center space-x-4">
                {/* Play Button Skeleton */}
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                
                {/* Content Skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                
                {/* Actions Skeleton */}
                <div className="flex-shrink-0">
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Regular Grid Items */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
        {Array.from({ length: regularItems }).map((_, index) => (
          <div
            key={`regular-${index}`}
            className={cn(
              "relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border",
              getSkeletonHeight()
            )}
          >
            <div className="p-2.5 flex flex-col items-center space-y-1.5 h-full">
              {/* Play Button Skeleton */}
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              
              {/* Station Name Skeleton */}
              <div className="w-full space-y-1">
                <Skeleton className="h-3 w-full" />
                {variant !== "compact" && <Skeleton className="h-3 w-3/4 mx-auto" />}
              </div>
              
              {/* Language Badge Skeleton */}
              <Skeleton className="h-4 w-12 rounded-full" />
              
              {/* Actions Skeleton - only for non-compact */}
              {variant !== "compact" && (
                <div className="flex gap-1 pt-1">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-4 h-4 rounded" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
