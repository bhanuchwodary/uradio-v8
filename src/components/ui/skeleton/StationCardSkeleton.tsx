
import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StationCardSkeletonProps {
  variant?: "default" | "featured" | "compact" | "large";
}

export const StationCardSkeleton: React.FC<StationCardSkeletonProps> = ({
  variant = "default"
}) => {
  const getCardStyles = () => {
    const baseStyles = "relative overflow-hidden animate-pulse bg-muted/20";
    
    if (variant === "featured") {
      return cn(baseStyles, "aspect-[2/1] w-full");
    }
    
    // All other variants use square aspect ratio
    return cn(baseStyles, "aspect-square w-full");
  };

  return (
    <Card className={getCardStyles()}>
      <div className="h-full w-full p-3 flex flex-col">
        {variant === "featured" ? (
          // Featured layout skeleton
          <div className="flex items-center gap-4 h-full">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ) : (
          // Square layout skeleton
          <div className="flex flex-col items-center justify-between h-full space-y-2">
            <div className="flex justify-center pt-1">
              <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center space-y-1 min-h-0">
              <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
            </div>
            <div className="flex justify-center pb-1">
              <div className="w-6 h-6 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
