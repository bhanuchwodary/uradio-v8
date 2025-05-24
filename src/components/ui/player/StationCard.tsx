
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
      return <Plus className="w-8 h-8" />;
    }
    
    return isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-0.5" />;
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-300 cursor-pointer material-transition elevation-hover h-full active:scale-95",
        isSelected 
          ? "bg-primary/10 border-primary/50 material-shadow-2" 
          : "bg-background/70 hover:bg-accent/30 border-border/50 material-shadow-1 active:bg-accent/40"
      )}
      onClick={onPlay} // Make entire card clickable
    >
      <div className="px-3 py-4 flex flex-col items-center space-y-3 h-full">
        <div 
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 material-shadow-1 ios-touch-target",
            isPlaying 
              ? "bg-primary text-primary-foreground material-shadow-2 animate-pulse scale-110" 
              : "bg-secondary text-secondary-foreground group-hover:bg-primary/20 group-active:scale-95"
          )}
        >
          {renderActionIcon()}
        </div>
        
        <h3 className="font-medium text-sm line-clamp-2 w-full text-center pt-1 min-h-[2.5rem] leading-tight">
          {station.name}
        </h3>
        
        {station.language && (
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span className="bg-muted/50 px-2 py-1 rounded-full">{station.language}</span>
          </div>
        )}
        
        <div className="flex justify-center space-x-2 mt-auto pt-2">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-9 w-9 material-transition rounded-full ios-touch-target active:scale-90", 
                station.isFavorite ? "text-yellow-500" : "text-muted-foreground"
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
          
          {onEdit && !station.isPrebuilt && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-9 w-9 text-blue-500 hover:bg-accent/50 material-transition rounded-full ios-touch-target active:scale-90"
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
              className="h-9 w-9 text-destructive hover:bg-accent/50 material-transition rounded-full ios-touch-target active:scale-90"
              onClick={(e) => handleButtonClick(e, onDelete)}
              aria-label="Delete station"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
