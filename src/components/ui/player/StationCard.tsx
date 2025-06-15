
import React from "react";
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
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isPlaying,
  isSelected,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  actionIcon = "play"
}) => {
  // Prevent event bubbling for control buttons
  const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    if (callback) callback();
  };

  // Determine the main action icon
  const renderActionIcon = () => {
    if (actionIcon === "add") {
      return <Plus className="w-5 h-5" />;
    }
    
    return isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />;
  };

  // Ensure language is preserved from station data with proper fallback
  const stationLanguage = station?.language && station.language !== "" ? station.language : "Unknown";

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group cursor-pointer h-full border-0 shadow-sm",
        "bg-gradient-to-br backdrop-blur-sm transform-gpu will-change-transform",
        // FIXED: Smooth transitions without blinking
        "transition-all duration-500 ease-out",
        isSelected 
          ? "from-primary/15 to-primary/5 shadow-xl ring-2 ring-primary/40 scale-[1.02] z-10" 
          : "from-surface-container/80 to-surface-container-high/60 hover:from-primary/8 hover:to-primary/3 hover:scale-[1.01]",
        "active:scale-[0.98] active:shadow-md"
      )}
      onClick={onPlay}
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      
      <div className="relative px-3 py-3 flex flex-col items-center space-y-2 h-full">
        {/* Enhanced Play Button with stable animations */}
        <div 
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
            "border border-white/10 backdrop-blur-sm transform-gpu",
            // FIXED: Stable transitions to prevent blinking
            "transition-all duration-300 ease-out",
            isPlaying 
              ? "bg-gradient-to-br from-primary to-primary/80 text-white shadow-primary/30 shadow-lg scale-110" 
              : "bg-gradient-to-br from-surface-container-high to-surface-container text-on-surface group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-110 group-hover:shadow-primary/20",
            "group-active:scale-105 ring-0 group-hover:ring-2 group-hover:ring-primary/20"
          )}
        >
          {renderActionIcon()}
        </div>
        
        {/* Enhanced Station Name with better typography */}
        <div className="w-full text-center space-y-1">
          <h3 className={cn(
            "font-semibold text-sm line-clamp-2 leading-tight px-1 min-h-[2.5rem] flex items-center justify-center",
            "text-on-surface transition-colors duration-200",
            isSelected ? "text-primary" : "group-hover:text-primary/80"
          )}>
            {station.name}
          </h3>
          
          {/* Enhanced Language Badge with better visual treatment */}
          <div className="flex items-center justify-center">
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
              "border shadow-sm backdrop-blur-sm transition-all duration-200",
              "bg-gradient-to-r",
              isSelected 
                ? "from-primary/20 to-primary/10 text-primary border-primary/30 shadow-primary/10" 
                : "from-surface-container to-surface-container-high text-on-surface-variant border-outline-variant/30 group-hover:from-primary/10 group-hover:to-primary/5 group-hover:text-primary/80 group-hover:border-primary/20"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-200",
                isSelected ? "bg-primary" : "bg-on-surface-variant/50 group-hover:bg-primary/60"
              )} />
              {stationLanguage}
            </span>
          </div>
        </div>
        
        {/* Enhanced Action Buttons with better spacing and interactions */}
        <div className="flex justify-center items-center space-x-1 mt-auto pt-2 min-h-[32px]">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-7 w-7 rounded-full transition-all duration-200 shadow-sm",
                "hover:shadow-md active:scale-90 transform-gpu",
                station.isFavorite 
                  ? "text-yellow-500 hover:text-yellow-600 bg-yellow-500/15 hover:bg-yellow-500/25 shadow-yellow-500/20" 
                  : "text-on-surface-variant hover:text-yellow-500 hover:bg-yellow-500/15 hover:shadow-yellow-500/10"
              )}
              onClick={(e) => handleButtonClick(e, onToggleFavorite)}
              aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn(
                "h-3.5 w-3.5 transition-all duration-200",
                station.isFavorite && "fill-yellow-500 scale-110"
              )} />
            </Button>
          )}
          
          {onEdit && !station.isFeatured && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-7 w-7 rounded-full transition-all duration-200 shadow-sm",
                "text-blue-500 hover:text-blue-600 hover:bg-blue-500/15 hover:shadow-md hover:shadow-blue-500/10",
                "active:scale-90 transform-gpu"
              )}
              onClick={(e) => handleButtonClick(e, onEdit)}
              aria-label="Edit station"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-7 w-7 rounded-full transition-all duration-200 shadow-sm",
                "text-destructive hover:text-destructive/80 hover:bg-destructive/15 hover:shadow-md hover:shadow-destructive/10",
                "active:scale-90 transform-gpu"
              )}
              onClick={(e) => handleButtonClick(e, onDelete)}
              aria-label="Delete station"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
