
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Star, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: Track;
  isPlaying?: boolean;
  isSelected?: boolean;
  onPlay: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isPlaying = false,
  isSelected = false,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite
}) => {
  const isEditable = !station.isPrebuilt && onEdit;
  const canDelete = onDelete !== undefined;
  const canFavorite = onToggleFavorite !== undefined;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 border-none shadow",
        isSelected 
          ? "bg-primary/10 dark:bg-primary/20" 
          : "bg-background/50 hover:bg-background/80"
      )}
    >
      <CardContent className="p-4 flex flex-col items-center">
        {/* Station Image/Icon */}
        <div 
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-full mb-3",
            isPlaying 
              ? "bg-primary text-primary-foreground animate-pulse" 
              : "bg-muted"
          )}
        >
          <Play className="h-6 w-6" />
        </div>
        
        {/* Station Name */}
        <h3 className="text-sm font-medium text-center mb-2 line-clamp-2">
          {station.name}
        </h3>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-1 mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onPlay}
          >
            <Play className="h-4 w-4" />
          </Button>
          
          {canFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                station.isFavorite && "text-yellow-500"
              )}
              onClick={onToggleFavorite}
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
          
          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-500"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
