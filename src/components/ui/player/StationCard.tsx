
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
      return <Plus className="w-6 h-6" />;
    }
    
    return isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />;
  };

  // Ensure language is preserved from station data
  const stationLanguage = station?.language || "";

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
      <div className="px-2 py-3 flex flex-col items-center space-y-2 h-full">
        <div 
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 material-shadow-1 ios-touch-target",
            isPlaying 
              ? "bg-primary text-primary-foreground material-shadow-2 animate-pulse scale-105" 
              : "bg-secondary text-secondary-foreground group-hover:bg-primary/20 group-active:scale-95"
          )}
        >
          {renderActionIcon()}
        </div>
        
        <h3 className="font-medium text-xs line-clamp-2 w-full text-center pt-1 min-h-[2rem] leading-tight px-1">
          {station.name}
        </h3>
        
        {stationLanguage && (
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span className="bg-muted/50 px-1.5 py-0.5 rounded-full text-xs">{stationLanguage}</span>
          </div>
        )}
        
        <div className="flex justify-center space-x-1 mt-auto pt-1">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-7 w-7 material-transition rounded-full ios-touch-target active:scale-90", 
                station.isFavorite ? "text-yellow-500" : "text-muted-foreground"
              )}
              onClick={(e) => handleButtonClick(e, onToggleFavorite)}
              aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn(
                "h-3 w-3",
                station.isFavorite && "fill-yellow-500"
              )} />
            </Button>
          )}
          
          {onEdit && !station.isPrebuilt && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-blue-500 hover:bg-accent/50 material-transition rounded-full ios-touch-target active:scale-90"
              onClick={(e) => handleButtonClick(e, onEdit)}
              aria-label="Edit station"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-destructive hover:bg-accent/50 material-transition rounded-full ios-touch-target active:scale-90"
              onClick={(e) => handleButtonClick(e, onDelete)}
              aria-label="Delete station"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
