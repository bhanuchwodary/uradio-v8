
import React from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, Edit, Trash2, Star } from "lucide-react";
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
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isPlaying,
  isSelected,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  // Prevent event bubbling for control buttons
  const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    if (callback) callback();
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-200 cursor-pointer",
        isSelected 
          ? "bg-primary/10 border-primary/50 shadow-lg" 
          : "bg-background/30 hover:bg-background/50 border-border/50"
      )}
      onClick={onPlay} // Make entire card clickable
    >
      <div className="px-3 py-4 flex flex-col items-center space-y-2">
        <div 
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
            isPlaying 
              ? "bg-primary text-primary-foreground" 
              : "bg-background/50 text-muted-foreground group-hover:bg-primary/20"
          )}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </div>
        
        <h3 className="font-medium text-sm truncate w-full text-center pt-1">
          {station.name}
        </h3>
        
        <div className="flex justify-center space-x-1 mt-auto">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-8 w-8", 
                station.isFavorite ? "text-yellow-500" : "text-muted-foreground"
              )}
              onClick={(e) => handleButtonClick(e, onToggleFavorite)}
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
              className="h-8 w-8 text-blue-500"
              onClick={(e) => handleButtonClick(e, onEdit)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-destructive"
              onClick={(e) => handleButtonClick(e, onDelete)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
