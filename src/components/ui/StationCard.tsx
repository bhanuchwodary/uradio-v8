
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Heart, 
  HeartOff, 
  Edit, 
  Trash2, 
  Radio,
  Globe
} from "lucide-react";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: Track;
  isCurrentlyPlaying?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  showControls?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isCurrentlyPlaying = false,
  isPlaying = false,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  showControls = true
}) => {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200 hover:shadow-lg",
      isCurrentlyPlaying 
        ? "ring-2 ring-primary bg-primary/5" 
        : "hover:shadow-md"
    )}>
      <CardContent className="p-4">
        {/* Station Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
            isCurrentlyPlaying 
              ? "bg-gradient-to-br from-primary to-blue-600 text-white" 
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            <Radio className={cn(
              "transition-all duration-200",
              isCurrentlyPlaying && isPlaying ? "animate-pulse h-8 w-8" : "h-6 w-6"
            )} />
          </div>
        </div>

        {/* Station Info */}
        <div className="text-center mb-4">
          <h3 className="font-semibold truncate mb-1">{station.name}</h3>
          {station.language && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Globe className="h-3 w-3 mr-1" />
              {station.language}
            </div>
          )}
        </div>

        {/* Play Button */}
        <div className="flex justify-center mb-4">
          <Button
            size="icon"
            variant={isCurrentlyPlaying ? "default" : "outline"}
            onClick={onPlay}
            className="h-12 w-12 rounded-full"
          >
            {isCurrentlyPlaying && isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFavorite}
              className="h-8 w-8"
            >
              {station.isFavorite ? (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              ) : (
                <HeartOff className="h-4 w-4" />
              )}
            </Button>
            
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Favorite indicator */}
        {station.isFavorite && (
          <div className="absolute top-2 right-2">
            <Heart className="h-4 w-4 text-red-500 fill-current" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
