
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
        "relative overflow-hidden group transition-all duration-300 cursor-pointer h-full active:scale-95 border-0 hover:shadow-2xl",
        isSelected 
          ? "bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-pink-500/20 shadow-xl ring-2 ring-blue-400/50 dark:ring-blue-500/50 scale-105 transform" 
          : "bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60 hover:from-white/90 hover:to-white/70 dark:hover:from-slate-700/90 dark:hover:to-slate-800/70 shadow-lg hover:scale-105 backdrop-blur-sm"
      )}
      onClick={onPlay}
    >
      {/* Animated background effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
      )}></div>
      
      <div className="relative z-10 px-3 py-4 flex flex-col items-center space-y-3 h-full">
        {/* Enhanced Play Button */}
        <div 
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg border-2",
            isPlaying 
              ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/30 border-red-300 scale-110 animate-pulse" 
              : isSelected
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/30 border-blue-300 scale-105"
              : "bg-gradient-to-r from-slate-100 to-white dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-500 group-hover:from-blue-500 group-hover:to-purple-600 group-hover:text-white group-hover:scale-110 group-hover:shadow-blue-500/30"
          )}
        >
          {renderActionIcon()}
        </div>
        
        {/* Station Name */}
        <h3 className="font-semibold text-sm line-clamp-2 w-full text-center leading-tight px-1 min-h-[2.5rem] flex items-center justify-center text-slate-800 dark:text-slate-200">
          {station.name}
        </h3>
        
        {/* Enhanced Language Badge */}
        <div className="flex items-center justify-center">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition-all duration-300",
            isSelected 
              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500" 
              : "bg-gradient-to-r from-slate-100/80 to-white/80 dark:from-slate-700/80 dark:to-slate-600/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-500 group-hover:from-blue-500/20 group-hover:to-purple-500/20 group-hover:text-blue-700 dark:group-hover:text-blue-300"
          )}>
            {stationLanguage}
          </span>
        </div>
        
        {/* Enhanced Action Buttons */}
        <div className="flex justify-center space-x-1 mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onToggleFavorite && (
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "h-8 w-8 rounded-xl transition-all duration-200 active:scale-90 backdrop-blur-sm", 
                station.isFavorite 
                  ? "text-yellow-500 hover:text-yellow-600 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-200 dark:border-yellow-600" 
                  : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10 border border-slate-200 dark:border-slate-600 hover:border-yellow-200"
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
              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all duration-200 active:scale-90 backdrop-blur-sm border border-blue-200 dark:border-blue-600"
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
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all duration-200 active:scale-90 backdrop-blur-sm border border-red-200 dark:border-red-600"
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
