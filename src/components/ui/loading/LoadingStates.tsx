
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  title?: string;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({ title, className }) => (
  <Card className={cn("p-6 space-y-4", className)}>
    {title && (
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-6 w-32" />
      </div>
    )}
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </Card>
);

export const PlayerLoadingState: React.FC = () => (
  <Card className="p-4 bg-gradient-to-br from-surface-container/60 to-surface-container/80 backdrop-blur-md border border-outline-variant/30 shadow-lg rounded-2xl">
    <div className="flex flex-col space-y-4">
      {/* Station info skeleton */}
      <div className="text-center px-2 space-y-2">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-3 w-32 mx-auto" />
        <Skeleton className="h-4 w-16 mx-auto rounded-full" />
      </div>

      {/* Controls skeleton */}
      <div className="flex items-center justify-center space-x-4 py-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      {/* Volume control skeleton */}
      <div className="flex items-center space-x-3 px-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-2 flex-1 rounded-full" />
      </div>
    </div>
  </Card>
);

interface SectionLoadingProps {
  title?: string;
  itemCount?: number;
  showHeader?: boolean;
}

export const SectionLoading: React.FC<SectionLoadingProps> = ({
  title,
  itemCount = 6,
  showHeader = true
}) => (
  <div className="space-y-4">
    {showHeader && (
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
    )}
    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const InlineLoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <LoadingSpinner size="sm" />
    <span className="text-sm text-muted-foreground animate-pulse">{text}</span>
  </div>
);

export const PageLoadingOverlay: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="font-semibold">Loading</h3>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
