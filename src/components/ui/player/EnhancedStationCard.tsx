
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Play, Pause, Edit, Trash2, Plus, Radio } from "lucide-react";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface EnhancedStationCardProps {
  station: Track;
  isActive?: boolean;
  isPlaying?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  actionIcon?: "add" | "edit" | "delete";
  showLanguage?: boolean;
  compact?: boolean;
}

export const EnhancedStationCard: React.FC<EnhancedStationCardProps> = ({
  station,
  isActive = false,
  isPlaying = false,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
  actionIcon,
  showLanguage = true,
  compact = false
}) => {
  const handleMainAction = () => {
    if (actionIcon === "add") {
      onSelect?.();
    } else if (onSelect) {
      onSelect();
    }
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg cursor-pointer",
        "bg-gradient-to-br from-surface-container to-surface-container-high",
        "border border-outline-variant/30 hover:border-primary/40",
        isActive && "ring-2 ring-primary/50 border-primary/60 bg-gradient-to-br from-primary-container/20 to-surface-container",
        compact ? "p-3" : "p-4"
      )}
      onClick={handleMainAction}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-12 translate-x-12" />
      </div>

      <div className="relative z-10">
        {/* Header with Play Button and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Play/Pause Button */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "flex-shrink-0 rounded-full transition-all duration-200 ios-touch-target",
                isActive
                  ? "bg-primary text-on-primary hover:bg-primary/90"
                  : "bg-surface-container-high text-on-surface hover:bg-primary/20 hover:text-primary"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
            >
              {isActive && isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Station Icon */}
            <div className="flex-shrink-0">
              <div className={cn(
                "rounded-full p-2 transition-colors",
                isActive ? "bg-primary/20 text-primary" : "bg-surface-container-highest text-on-surface-variant"
              )}>
                <Radio className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {actionIcon === "add" && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            {onToggleFavorite && (
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "h-8 w-8 rounded-full transition-colors",
                  station.isFavorite
                    ? "text-red-500 hover:text-red-600"
                    : "text-on-surface-variant hover:text-red-500"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <Heart className={cn("h-4 w-4", station.isFavorite && "fill-current")} />
              </Button>
            )}

            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-on-surface-variant hover:text-error hover:bg-error/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Station Information */}
        <div className="space-y-2">
          <h3 
            className={cn(
              "font-semibold leading-tight line-clamp-2 transition-colors",
              isActive ? "text-primary" : "text-on-surface",
              compact ? "text-sm" : "text-base"
            )}
            title={station.name}
          >
            {station.name}
          </h3>

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showLanguage && station.language && (
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors",
                  isActive 
                    ? "bg-primary/20 text-primary" 
                    : "bg-secondary-container text-on-secondary-container"
                )}>
                  {station.language}
                </span>
              )}

              {station.isFeatured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-tertiary-container text-on-tertiary-container">
                  Featured
                </span>
              )}
            </div>

            {/* Play Time Indicator */}
            {station.playTime && station.playTime > 0 && (
              <div className="text-xs text-on-surface-variant">
                {Math.round(station.playTime / 60)}m played
              </div>
            )}
          </div>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </Card>
  );
};
