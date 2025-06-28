import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star, Trash2, User, TrendingUp } from "lucide-react";
import { StationCardButton } from "./StationCardButton";
import { EnhancedStationCardProps } from "./types";
import { StationCardActions } from "./StationCardActions";

export const EnhancedStationCard: React.FC<EnhancedStationCardProps> = React.memo(({
  station,
  isPlaying,
  isSelected,
  inPlaylist,
  isProcessing,
  showStats,
  onToggleFavorite,
  onEdit,
  onDelete,
  actionIcon,
  context,
  isDisabled,
  variant = "default"
}) => {
  const handlePlayClick = (e?: React.MouseEvent) => {
    if (isDisabled) return;
    if (e) e.stopPropagation?.();
    // Add your play logic here
  };

  const getCardStyles = () => {
    const baseStyles =
      "relative overflow-hidden flex flex-col items-center justify-between transition-all duration-200 rounded-xl shadow-md cursor-pointer select-none";
    if (variant === "featured") {
      return cn(
        baseStyles,
        "aspect-[2/1] w-full", // 2:1 aspect ratio for featured cards
        "bg-gradient-to-br from-primary/15 to-primary/5 shadow-lg ring-1 ring-primary/20",
        "hover:from-primary/20 hover:to-primary/10 hover:ring-primary/30"
      );
    }
    // All other variants use square aspect ratio for consistency
    return cn(
      baseStyles,
      "aspect-square w-full", // Perfect square for all standard cards
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
    if (station.isFeatured)
      return <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />;
    if (station.playTime && station.playTime > 0)
      return (
        <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
      );
    if (!station.isFeatured)
      return <User className="w-3 h-3 text-blue-500 flex-shrink-0" />;
    return null;
  };

  return (
    <Card className={getCardStyles()} onClick={handlePlayClick}>
      <div className="h-full w-full p-2.5 flex flex-col">
        {variant === "featured" ? (
          // Featured layout - horizontal with proper alignment
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
          // Square layout - optimized mobile-friendly vertical layout with improved spacing and controls sizing
          <div className="flex flex-col h-full justify-between items-center space-y-2">
            {/* Station Name - Top section with improved font size and spacing */}
            <div className="flex-shrink-0 w-full text-center px-2 pt-2">
              <h3
                className={cn(
                  "font-medium text-base leading-tight line-clamp-2 break-words",
                  "min-h-[2.2rem] flex items-center justify-center",
                  isSelected
                    ? "text-primary font-semibold"
                    : inPlaylist && actionIcon === "add"
                    ? "text-green-700 font-medium"
                    : isProcessing
                    ? "text-blue-700 font-medium"
                    : "text-foreground"
                )}
              >
                {station.name}
              </h3>
            </div>
            {/* Language Badge - better spacing and font size */}
            <div className="flex-shrink-0 mt-1 mb-2">
              <span
                className={cn(
                  "bg-gradient-to-r px-3 py-1 rounded-full text-xs font-medium border shadow-sm",
                  "transition-all duration-200 whitespace-nowrap",
                  isSelected
                    ? "from-primary/20 to-primary/10 text-primary border-primary/30"
                    : inPlaylist && actionIcon === "add"
                    ? "from-green-500/20 to-green-500/10 text-green-600 border-green-500/30"
                    : isProcessing
                    ? "from-blue-500/20 to-blue-500/10 text-blue-600 border-blue-500/30"
                    : "from-muted/60 to-muted/40 text-muted-foreground border-muted/50"
                )}
              >
                {station.language || "Unknown"}
                {inPlaylist && actionIcon === "add" && " ✓"}
                {isProcessing && " ..."}
              </span>
            </div>
            {/* Controls - bottom section, more visible and spaced */}
            <div className="flex-shrink-0 flex justify-center items-center space-x-3 w-full px-2 pb-2">
              {/* Favorite Button */}
              {onToggleFavorite && (
                <button
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-90",
                    station.isFavorite
                      ? "text-yellow-500 hover:text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20"
                      : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  aria-label={
                    station.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-all duration-200",
                      station.isFavorite && "fill-yellow-500"
                    )}
                  />
                </button>
              )}
              {/* Play Button */}
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                  "transform group-hover:scale-110 group-active:scale-95",
                  isPlaying
                    ? "bg-primary text-primary-foreground shadow-md"
                    : inPlaylist && actionIcon === "add"
                    ? "bg-green-500/20 text-green-600 border border-green-500/30"
                    : isProcessing
                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 animate-pulse"
                    : "bg-secondary/80 text-secondary-foreground group-hover:bg-primary/30",
                  isDisabled && "group-hover:scale-100"
                )}
                onClick={handlePlayClick}
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
                  className="h-7 w-7 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-90 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  aria-label={
                    context === "playlist"
                      ? "Remove from playlist"
                      : "Delete station"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
},
(prevProps, nextProps) =>
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

EnhancedStationCard.displayName = "EnhancedStationCard";

export default EnhancedStationCard;
