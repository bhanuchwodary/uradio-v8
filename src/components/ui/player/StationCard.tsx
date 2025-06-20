
import React, { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, Edit, Trash2, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: Track;
  isPlaying: boolean;
  isSelected: boolean;
  onPlay: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  actionIcon?: "play" | "add";
  context?: "playlist" | "library";
}

export const StationCard: React.FC<StationCardProps> = memo(({
  station,
  isPlaying,
  isSelected,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  actionIcon = "play",
  context = "library"
}) => {
  // Memoize event handlers to prevent unnecessary re-renders
  const handleButtonClick = useCallback((e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    if (callback) callback();
  }, []);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    handleButtonClick(e, onEdit);
  }, [handleButtonClick, onEdit]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    handleButtonClick(e, onDelete);
  }, [handleButtonClick, onDelete]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    handleButtonClick(e, onToggleFavorite);
  }, [handleButtonClick, onToggleFavorite]);

  // Determine the main action icon
  const ActionIcon = actionIcon === "add" ? Plus : (isPlaying ? Pause : Play);

  // Ensure language is preserved from station data with proper fallback
  const stationLanguage = station?.language && station.language !== "" ? station.language : "Unknown";

  // Determine if edit button should be shown
  const shouldShowEditButton = () => {
    // In playlist context, don't show edit for user-added stations (non-featured)
    if (context === "playlist" && !station.isFeatured) {
      return false;
    }
    // In library context, show edit for non-featured stations
    return !station.isFeatured && onEdit;
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-300 cursor-pointer h-full",
        "transform hover:scale-105 active:scale-95 border-0 backdrop-blur-sm",
        "hover:shadow-xl hover:-translate-y-1",
        isSelected 
          ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg ring-2 ring-primary/30 scale-105" 
          : "bg-gradient-to-br from-background/80 to-background/60 hover:from-accent/40 hover:to-accent/20 shadow-md"
      )}
      onClick={onPlay}
    >
      <div className="px-2 py-2.5 flex flex-col items-center space-y-1.5 h-full">
        {/* Play Button with enhanced animations */}
        <div 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
            "transform group-hover:scale-110 group-active:scale-95",
            isPlaying 
              ? "bg-primary text-primary-foreground shadow-md scale-110 animate-pulse" 
              : "bg-secondary/80 text-secondary-foreground group-hover:bg-primary/30"
          )}
        >
          <ActionIcon className={cn(
            "transition-transform duration-200",
            actionIcon !== "add" && !isPlaying && "ml-0.5",
            "w-5 h-5"
          )} />
        </div>
        
        {/* Station Name with better typography */}
        <h3 className={cn(
          "font-medium text-xs line-clamp-2 w-full text-center leading-tight px-1",
          "min-h-[2rem] flex items-center justify-center transition-colors duration-200",
          isSelected ? "text-primary font-semibold" : "text-foreground"
        )}>
          {station.name}
        </h3>
        
        {/* Language Badge with enhanced styling */}
        <div className="flex items-center justify-center">
          <span className={cn(
            "bg-gradient-to-r px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-sm",
            "transition-all duration-200 transform group-hover:scale-105",
            isSelected 
              ? "from-primary/20 to-primary/10 text-primary border-primary/30" 
              : "from-muted/60 to-muted/40 text-muted-foreground border-muted/50"
          )}>
            {stationLanguage}
          </span>
        </div>
        
        {/* Action Buttons with improved hover states */}
        <div className="flex justify-center space-x-0.5 mt-auto pt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-6 w-6 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-90", 
                station.isFavorite 
                  ? "text-yellow-500 hover:text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20" 
                  : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
              )}
              onClick={handleFavoriteClick}
              aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn(
                "h-3 w-3 transition-all duration-200",
                station.isFavorite && "fill-yellow-500"
              )} />
            </Button>
          )}
          
          {shouldShowEditButton() && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-90"
              onClick={handleEditClick}
              aria-label="Edit station"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-90"
              onClick={handleDeleteClick}
              aria-label={context === "playlist" ? "Remove from playlist" : "Delete station"}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison for better performance
  return (
    prevProps.station.url === nextProps.station.url &&
    prevProps.station.name === nextProps.station.name &&
    prevProps.station.language === nextProps.station.language &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.station.isFavorite === nextProps.station.isFavorite &&
    prevProps.context === nextProps.context &&
    prevProps.actionIcon === nextProps.actionIcon
  );
});

StationCard.displayName = "StationCard";
