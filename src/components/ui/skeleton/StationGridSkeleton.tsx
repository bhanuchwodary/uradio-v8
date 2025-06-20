
import React from "react";
import { StationCardSkeleton } from "./StationCardSkeleton";

interface StationGridSkeletonProps {
  count?: number;
}

export const StationGridSkeleton: React.FC<StationGridSkeletonProps> = ({ 
  count = 12 
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <StationCardSkeleton key={index} />
      ))}
    </div>
  );
};
