
import React from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, Edit, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  // Prevent event bubbling for control buttons
  const handleButtonClick = (e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    if (callback) callback();
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-200 cursor-pointer border shadow-lg",
        isDark ? (
          isSelected 
            ? "bg-background/50 border-primary/40" 
            : "bg-background/30 hover:bg-background/40 border-white/10"
        ) : (
          isSelected 
            ? "bg-primary/10 border-primary/30 shadow-lg" 
            : "bg-white/40 hover:bg-white/50 border-white/30"
        ),
        isPlaying && "animate-pulse-glow"
      )}
      onClick={onPlay} // Make entire card clickable
    >
      {/* Background glow effect when selected */}
      {isSelected && (
        <div className={cn(
          "absolute inset-0 -z-10 opacity-20 blur-md",
          isDark ? "bg-primary/60" : "bg-primary/30"
        )} />
      )}
      
      <div className="px-3 py-4 flex flex-col items-center space-y-2">
        {/* Station icon */}
        <div 
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-colors shadow-md",
            isPlaying 
              ? "bg-primary text-primary-foreground animate-float" 
              : isDark 
                ? "bg-background/60 text-muted-foreground group-hover:bg-primary/20"
                : "bg-white/70 text-muted-foreground group-hover:bg-primary/20"
          )}
        >
          {isPlaying ? (
            <Pause className={cn("w-8 h-8", isPlaying && "animate-pulse-glow")} />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </div>
        
        {/* Station name */}
        <h3 className={cn(
          "font-medium text-sm truncate w-full text-center pt-1",
          isSelected && "text-primary"
        )}>
          {station.name}
        </h3>
        
        {/* Controls */}
        <div className="flex justify-center space-x-1 mt-auto">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-8 w-8", 
                station.isFavorite 
                  ? "text-yellow-500" 
                  : "text-muted-foreground hover:text-yellow-500/90"
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
              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
              onClick={(e) => handleButtonClick(e, onEdit)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
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
