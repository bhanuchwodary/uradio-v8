
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
  onToggleInPlaylist?: () => void; // <-- Add this line for typing support
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

  console.log("StationCard rendering:", { name: station.name, language: stationLanguage, isPlaying, isSelected });

  const hasActionButtons = onToggleFavorite || (onEdit && !station.isFeatured) || onDelete;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-200 cursor-pointer active:scale-95 rounded-xl border",
        isSelected 
          ? "bg-primary/10 border-primary/30 shadow-lg" 
          : "bg-background/70 hover:bg-accent/40 border-border/20 shadow-md hover:shadow-lg backdrop-blur-sm"
      )}
      onClick={onPlay}
    >
      <div className="p-2 flex flex-col items-center text-center space-y-2">
        {/* Play/Add Button */}
        <div 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
            isPlaying 
              ? "bg-primary text-primary-foreground shadow-md scale-105" 
              : "bg-secondary/80 text-secondary-foreground group-hover:bg-primary/30"
          )}
        >
          {renderActionIcon()}
        </div>
        
        {/* Station Info */}
        <div className="w-full min-h-[3.25rem]">
          <h3 className="font-semibold text-xs leading-tight line-clamp-2 h-8 flex items-center justify-center">
            {station.name}
          </h3>
          <p className="text-[10px] text-muted-foreground truncate">{stationLanguage}</p>
        </div>
        
        {/* Action Buttons */}
        {hasActionButtons && (
          <div className="flex justify-center items-center space-x-1 border-t border-border/20 w-full pt-2">
            {onToggleFavorite && (
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "h-7 w-7 rounded-full transition-all duration-200 active:scale-90", 
                  station.isFavorite 
                    ? "text-yellow-500 hover:text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20" 
                    : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                )}
                onClick={(e) => handleButtonClick(e, onToggleFavorite)}
                aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={cn(
                  "h-4 w-4",
                  station.isFavorite && "fill-yellow-500"
                )} />
              </Button>
            )}
            
            {onEdit && !station.isFeatured && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-full transition-all duration-200 active:scale-90"
                onClick={(e) => handleButtonClick(e, onEdit)}
                aria-label="Edit station"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-full transition-all duration-200 active:scale-90"
                onClick={(e) => handleButtonClick(e, onDelete)}
                aria-label="Delete station"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
