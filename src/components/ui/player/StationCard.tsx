
import React from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, Edit, Trash2, Star, Plus, Languages } from "lucide-react";
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
      return <Plus className="w-7 h-7" />;
    }
    
    return isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />;
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-300 cursor-pointer material-transition elevation-hover h-full",
        isSelected 
          ? "bg-primary/10 border-primary/50 material-shadow-2" 
          : "bg-background/70 hover:bg-accent/30 border-border/50 material-shadow-1"
      )}
      onClick={onPlay} // Make entire card clickable
    >
      <div className="px-2.5 py-3 flex flex-col items-center space-y-2 h-full">
        <div 
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-colors material-shadow-1",
            isPlaying 
              ? "bg-primary text-primary-foreground material-shadow-2 animate-pulse" 
              : "bg-secondary text-secondary-foreground group-hover:bg-primary/20"
          )}
        >
          {renderActionIcon()}
        </div>
        
        <h3 className="font-medium text-sm line-clamp-2 w-full text-center pt-1 min-h-[2.5rem]">
          {station.name}
        </h3>
        
        {station.language && (
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <Languages className="h-3.5 w-3.5 mr-1" />
            <span>{station.language}</span>
          </div>
        )}
        
        <div className="flex justify-center space-x-1 mt-auto pt-1">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-7 w-7 material-transition rounded-full", 
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
              className="h-7 w-7 text-blue-500 hover:bg-accent/50 material-transition rounded-full"
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
              className="h-7 w-7 text-destructive hover:bg-accent/50 material-transition rounded-full"
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
