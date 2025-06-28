import React, { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StationCardButton } from "./StationCardButton";
import { StationCardInfo } from "./StationCardInfo";
import { StationCardActions } from "./StationCardActions";
import { StationCardProps } from "./types";
import { Star, Trash2, TrendingUp, User } from "lucide-react";

export interface EnhancedStationCardProps extends StationCardProps {
  variant?: "default" | "featured" | "compact" | "large";
  showStats?: boolean;
  priority?: "high" | "medium" | "low";
}

export const EnhancedStationCard: React.FC<EnhancedStationCardProps> = memo(({
  station,
  isPlaying,
  isSelected,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  actionIcon = "play",
  context = "library",
  inPlaylist = false,
  isAddingToPlaylist = false,
  variant = "default",
  showStats = false,
  priority = "medium"
}) => {
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (actionIcon === "add" && (inPlaylist || isAddingToPlaylist)) {
      return;
    }

    if (actionIcon === "play" || context === "playlist") {
      onPlay();
    } else if (actionIcon === "add" && !inPlaylist) {
      onPlay();
    }
  }, [actionIcon, context, inPlaylist, isAddingToPlaylist, onPlay]);

  const isProcessing = actionIcon === "add" && isAddingToPlaylist;
  const isDisabled = actionIcon === "add" && (inPlaylist || isProcessing);

  const getCardStyles = () => {
    const baseStyles = cn(
      "relative overflow-hidden group transition-all duration-300 cursor-pointer",
      "transform hover:scale-105 active:scale-95 border-0 backdrop-blur-sm",
      "hover:shadow-xl hover:-translate-y-1",
      isDisabled && "hover:scale-100 cursor-default"
    );

    if (variant === "featured") {
      return cn(
        baseStyles,
        "aspect-[2/1] w-full",
        "bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg ring-1 ring-primary/20",
        "hover:from-primary/20 hover:to-primary/10 hover:ring-primary/30"
      );
    }

    return cn(
      baseStyles,
      "aspect-square w-full",
      isSelected
        ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg ring-2 ring-primary/30"
        : inPlaylist && actionIcon === "add"
        ? "bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-md ring-1 ring-green-500/20"
        : isProcessing
        ? "bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-md ring-1 ring-blue-500/20"
        : "bg-gradient-to-br from-background/80 to-background/60 hover:from-accent/40 hover:to-accent/20 shadow-md"
    );
  };

  const getStationIcon = () => {
    if (station.isFeatured) return <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />;
    if (station.playTime && station.playTime > 0) return <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />;
    if (!station.isFeatured) return <User className="w-3 h-3 text-blue-500 flex-shrink-0" />;
    return null;
  };

  return (
    <Card className={getCardStyles()} onClick={handlePlayClick}>
      <div className="h-full w-full p-2.5 flex flex-col">
        {variant === "featured" ? (
          <div className="flex items-center gap-4 h-full">
            <div className="flex-shrink-0">
              <StationCardButton
                station={station}
                isPlaying={isPlaying}
                isSelected={isSelected}
                actionIcon={actionIcon}
                context={context}
                inPlaylist={inPlaylist}
                isAddingToPlaylist={isProcessing}
                onClick={handlePlayClick}
                isDisabled={isDisabled}
                isProcessing={isProcessing}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                {getStationIcon()}
                <h3 className="font-semibold text-sm truncate text-foreground">
                  {station.name}
                </h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {station.language || "Unknown"}
                </span>
                {showStats && station.playTime && (
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(station.playTime / 60)}m played
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <StationCardActions
                station={station}
                context={context}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between items-center space-y-1">
            {/* Station Name */}
            <div className="flex-shrink-0 w-full text-center px-0.5">
              <h3 className={cn(
                "font-medium text-xs leading-tight line-clamp-2 break-words",
                "min-h-[1.8rem] flex items-center justify-center",
                isSelected ? "text-primary font-semibold"
                : inPlaylist && actionIcon === "add" ? "text-green-700 font-medium"
                : isProcessing ? "text-blue-700 font-medium"
                : "text-foreground"
              )}>
                {station.name}
              </h3>
            </div>

            {/* Language Badge */}
            <div className="flex-shrink-0">
              <span className={cn(
                "bg-gradient-to-r px-1.5 py-0.5 rounded-full text-[9px] font-medium border shadow-sm",
                "transition-all duration-200 whitespace-nowrap",
                isSelected
                  ? "from-primary/20 to-primary/10 text-primary border-primary/30"
                  : inPlaylist && actionIcon === "add"
                  ? "from-green-500/20 to-green-500/10 text-green-600 border-green-500/30"
                  : isProcessing
                  ? "from-blue-500/20 to-blue-500/10 text-blue-600 border-blue-500/30"
                  : "from-muted/60 to-muted/40 text-muted-foreground border-muted/50"
              )}>
                {station.language || "Unknown"}
                {inPlaylist && actionIcon === "add" && " ✓"}
                {isProcessing && " ..."}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex justify-center items-center w-full space-x-4">
              {/* Favorite Button */}
              {onToggleFavorite && (
                <button
                  className={cn(
                    "h-9 w-9 flex items-center justify-center transition-all duration-200 rounded-full",
                    "hover:scale-110 active:scale-90"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <Star className={cn(
                    "h-5 w-5 transition-all duration-200",
                    station.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/70 hover:text-muted-foreground"
                  )} />
                </button>
              )}

              {/* Play Button */}
              <div
                className={cn(
                  "flex items-center justify-center transition-all duration-300",
                  "w-10 h-10", // Slightly larger primary action
                  "group-hover:scale-110 group-active:scale-95",
                  isPlaying
                    ? "bg-primary text-primary-foreground shadow-md rounded-full"
                    : inPlaylist && actionIcon === "add"
                    ? "bg-green-500/20 text-green-600 border border-green-500/30 rounded-full"
                    : isProcessing
                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 animate-pulse rounded-full"
                    : "bg-secondary/80 text-secondary-foreground rounded-full group-hover:bg-primary/30",
                  isDisabled && "group-hover:scale-100"
                )}
                onClick={handlePlayClick}
                style={{ minWidth: 40, minHeight: 40 }} // ensure not clipped
              >
                <StationCardButton
                  station={station}
                  isPlaying={isPlaying}
                  isSelected={isSelected}
                  actionIcon={actionIcon}
                  context={context}
                  inPlaylist={inPlaylist}
                  isAddingToPlaylist={isProcessing}
                  onClick={handlePlayClick}
                  isDisabled={isDisabled}
                  isProcessing={isProcessing}
                />
              </div>

              {/* Delete Button */}
              {onDelete && (
                <button
                  className="h-9 w-9 text-destructive/70 hover:text-destructive transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-90 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  aria-label={context === "playlist" ? "Remove from playlist" : "Delete station"}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Memoization logic remains the same
  return (
    prevProps.station.url === nextProps.station.url &&
    prevProps.station.name === nextProps.station.name &&
    prevProps.station.language === nextProps.station.language &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.station.isFavorite === nextProps.station.isFavorite &&
    prevProps.context === nextProps.context &&
    prevProps.actionIcon === nextProps.actionIcon &&
    prevProps.inPlaylist === nextProps.inPlaylist &&
    prevProps.variant === nextProps.variant
  );
});

EnhancedStationCard.displayName = "EnhancedStationCard";
