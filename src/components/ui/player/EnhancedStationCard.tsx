
import React from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, Edit, Trash2, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EnhancedStationCardProps {
  station: Track;
  isPlaying: boolean;
  isSelected: boolean;
  onPlay: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  actionIcon?: "play" | "add";
}

export const EnhancedStationCard: React.FC<EnhancedStationCardProps> = ({
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

  // Generate background gradient based on station name
  const getStationBg = (name: string): string => {
    // Generate a pseudo-random number based on the station name
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    
    return actionIcon === "add" 
      ? `from-accent/30 to-accent/5`
      : `from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10`;
  };

  // Determine the main action icon
  const renderActionIcon = () => {
    if (actionIcon === "add") {
      return <Plus className="w-7 h-7" />;
    }
    
    return isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />;
  };

  const stationBg = getStationBg(station.name);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden group transition-all duration-300 cursor-pointer",
          isSelected 
            ? "bg-gradient-to-br from-primary/20 to-background border-primary/50 material-shadow-2" 
            : `bg-gradient-to-br ${stationBg} border-border/50 material-shadow-1 hover:material-shadow-2`
        )}
        onClick={onPlay}
      >
        <div className="px-4 py-5 flex flex-col items-center space-y-3">
          <motion.div 
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-colors material-shadow-1",
              isPlaying 
                ? "bg-primary text-primary-foreground material-shadow-2" 
                : "bg-secondary text-secondary-foreground group-hover:bg-accent"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {renderActionIcon()}
          </motion.div>
          
          <h3 className="font-medium text-base truncate w-full text-center">
            {station.name}
          </h3>
          
          {station.language && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-background/70 text-muted-foreground">
              {station.language}
            </span>
          )}
          
          <div className="flex justify-center space-x-1 mt-auto">
            {onToggleFavorite && (
              <Button 
                size="icon" 
                variant="ghost" 
                className={cn(
                  "h-8 w-8 material-transition", 
                  station.isFavorite ? "text-yellow-500" : "text-muted-foreground"
                )}
                onClick={(e) => handleButtonClick(e, onToggleFavorite)}
              >
                <Star className={cn(
                  "h-4 w-4 transition-transform",
                  station.isFavorite && "fill-yellow-500",
                  "group-hover:scale-110 duration-300"
                )} />
              </Button>
            )}
            
            {onEdit && !station.isPrebuilt && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-blue-500 hover:bg-accent/50 material-transition"
                onClick={(e) => handleButtonClick(e, onEdit)}
              >
                <Edit className="h-4 w-4 transition-transform group-hover:scale-110 duration-300" />
              </Button>
            )}
            
            {onDelete && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-destructive hover:bg-accent/50 material-transition"
                onClick={(e) => handleButtonClick(e, onDelete)}
              >
                <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110 duration-300" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
