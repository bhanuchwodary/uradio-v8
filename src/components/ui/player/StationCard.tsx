
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
  const isMetallic = document.documentElement.classList.contains('metallic');

  console.log("StationCard rendering:", { name: station.name, language: stationLanguage, isPlaying, isSelected });

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-200 cursor-pointer h-full active:scale-95 border-0",
        // Standard themes
        !isMetallic && (
          isSelected 
            ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg ring-2 ring-primary/30" 
            : "bg-gradient-to-br from-background/80 to-background/60 hover:from-accent/40 hover:to-accent/20 shadow-md hover:shadow-lg backdrop-blur-sm"
        ),
        // Metallic theme
        isMetallic && (
          isSelected 
            ? "metallic-station-card selected"
            : "metallic-station-card hover:elevation-2"
        )
      )}
      onClick={onPlay}
    >
      <div className="px-2 py-2.5 flex flex-col items-center space-y-1.5 h-full">
        {/* Play Button */}
        <div 
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
            // Standard themes
            !isMetallic && (
              isPlaying 
                ? "bg-primary text-primary-foreground shadow-md scale-105" 
                : "bg-secondary/80 text-secondary-foreground group-hover:bg-primary/30 group-hover:scale-105 group-active:scale-95"
            ),
            // Metallic theme
            isMetallic && (
              isPlaying 
                ? "metallic-play-button playing" 
                : "metallic-play-button group-hover:scale-105 group-active:scale-95"
            )
          )}
        >
          {renderActionIcon()}
        </div>
        
        {/* Station Name */}
        <h3 className="font-medium text-xs line-clamp-2 w-full text-center leading-tight px-1 min-h-[2rem] flex items-center justify-center">
          {station.name}
        </h3>
        
        {/* Language Badge */}
        <div className="flex items-center justify-center">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-sm",
            // Standard themes
            !isMetallic && (
              isSelected 
                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30" 
                : "bg-gradient-to-r from-muted/60 to-muted/40 text-muted-foreground border-muted/50"
            ),
            // Metallic theme
            isMetallic && (
              isSelected 
                ? "metallic-language-badge selected"
                : "metallic-language-badge"
            )
          )}>
            {stationLanguage}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-0.5 mt-auto pt-1">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-6 w-6 rounded-full transition-all duration-200 active:scale-90",
                // Standard themes
                !isMetallic && (
                  station.isFavorite 
                    ? "text-yellow-500 hover:text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20" 
                    : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
                ),
                // Metallic theme
                isMetallic && (
                  station.isFavorite 
                    ? "metallic-button text-yellow-400 hover:text-yellow-300" 
                    : "metallic-button text-muted-foreground hover:text-yellow-400"
                )
              )}
              onClick={(e) => handleButtonClick(e, onToggleFavorite)}
              aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn(
                "h-3 w-3",
                station.isFavorite && "fill-current"
              )} />
            </Button>
          )}
          
          {onEdit && !station.isFeatured && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-6 w-6 rounded-full transition-all duration-200 active:scale-90",
                // Standard themes
                !isMetallic && 
                  "text-blue-500 hover:text-blue-600 hover:bg-blue-500/10",
                // Metallic theme
                isMetallic && 
                  "metallic-button text-blue-400 hover:text-blue-300"
              )}
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
              className={cn(
                "h-6 w-6 rounded-full transition-all duration-200 active:scale-90",
                // Standard themes
                !isMetallic && 
                  "text-destructive hover:text-destructive/80 hover:bg-destructive/10",
                // Metallic theme
                isMetallic && 
                  "metallic-button text-red-400 hover:text-red-300"
              )}
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
