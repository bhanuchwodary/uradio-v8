
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
      return <Plus className="w-6 h-6 sm:w-8 sm:h-8" />;
    }
    
    return isPlaying ? 
      <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : 
      <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-0.5 sm:ml-1" />;
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-300 cursor-pointer material-transition elevation-hover",
        isSelected 
          ? "bg-primary/10 border-primary/50 material-shadow-2" 
          : "bg-background/70 hover:bg-accent/30 border-border/50 material-shadow-1"
      )}
      onClick={onPlay} // Make entire card clickable
    >
      <div className="px-2 sm:px-3 py-3 sm:py-4 flex flex-col items-center space-y-1 sm:space-y-2">
        <div 
          className={cn(
            "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors material-shadow-1",
            isPlaying 
              ? "bg-primary text-primary-foreground material-shadow-2" 
              : "bg-secondary text-secondary-foreground group-hover:bg-primary/20"
          )}
        >
          {renderActionIcon()}
        </div>
        
        <h3 className="font-medium text-xs sm:text-sm truncate w-full text-center pt-1">
          {station.name}
        </h3>
        
        {station.language && (
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {station.language}
          </span>
        )}
        
        <div className="flex justify-center space-x-1 mt-auto">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-6 w-6 sm:h-8 sm:w-8 material-transition", 
                station.isFavorite ? "text-yellow-500" : "text-muted-foreground"
              )}
              onClick={(e) => handleButtonClick(e, onToggleFavorite)}
            >
              <Star className={cn(
                "h-3 w-3 sm:h-4 sm:w-4",
                station.isFavorite && "fill-yellow-500"
              )} />
            </Button>
          )}
          
          {onEdit && !station.isPrebuilt && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 hover:bg-accent/50 material-transition"
              onClick={(e) => handleButtonClick(e, onEdit)}
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 sm:h-8 sm:w-8 text-destructive hover:bg-accent/50 material-transition"
              onClick={(e) => handleButtonClick(e, onDelete)}
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
