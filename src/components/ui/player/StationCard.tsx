
import React, { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StationCardButton } from "./StationCardButton";
import { StationCardInfo } from "./StationCardInfo";
import { StationCardActions } from "./StationCardActions";
import { StationCardProps } from "./types";

export const StationCard: React.FC<StationCardProps> = memo(({
  station,
  isPlaying,
  isSelected,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  actionIcon = "play",
  context = "library",
  inPlaylist = false,
  isAddingToPlaylist = false
}) => {
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log("StationCard: Play button clicked for station:", station.name);
    console.log("StationCard: Action icon:", actionIcon, "In playlist:", inPlaylist, "Is adding:", isAddingToPlaylist);
    
    // Prevent adding to playlist if already in playlist or currently being added
    if (actionIcon === "add" && (inPlaylist || isAddingToPlaylist)) {
      console.log("STATION CARD: Blocked click", { 
        name: station.name, 
        url: station.url,
        inPlaylist,
        isAddingToPlaylist
      });
      return;
    }
    
    // Always call onPlay - let the parent component handle the logic
    console.log("StationCard: Calling onPlay for station:", station.name);
    onPlay();
  }, [actionIcon, inPlaylist, isAddingToPlaylist, onPlay, station.name, station.url]);

  // Check if the station is being processed - but don't use global isAddingToPlaylist
  // Only use it for the specific station being added
  const isProcessing = actionIcon === "add" && isAddingToPlaylist;
  const isDisabled = actionIcon === "add" && (inPlaylist || isProcessing);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-300 cursor-pointer h-full",
        "transform hover:scale-105 active:scale-95 border-0 backdrop-blur-sm",
        "hover:shadow-xl hover:-translate-y-1",
        isSelected 
          ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg ring-2 ring-primary/30" 
          : inPlaylist && actionIcon === "add"
          ? "bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-md ring-1 ring-green-500/20"
          : isProcessing
          ? "bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-md ring-1 ring-blue-500/20"
          : "bg-gradient-to-br from-background/80 to-background/60 hover:from-accent/40 hover:to-accent/20 shadow-md",
        // Disable hover effects if already in playlist or being processed
        isDisabled && "hover:scale-100 cursor-default"
      )}
      onClick={handlePlayClick}
    >
      <div className="px-2 py-2.5 flex flex-col items-center space-y-1.5 h-full">
        {/* Play Button with enhanced animations and playlist status */}
        <StationCardButton
          station={station}
          isPlaying={isPlaying}
          isSelected={isSelected}
          actionIcon={actionIcon}
          context={context}
          inPlaylist={inPlaylist}
          isAddingToPlaylist={isProcessing} // Only pass processing state for this specific card
          onClick={handlePlayClick}
          isDisabled={isDisabled}
          isProcessing={isProcessing}
        />
        
        {/* Station Name and Language */}
        <StationCardInfo
          station={station}
          isSelected={isSelected}
          inPlaylist={inPlaylist}
          isProcessing={isProcessing}
          actionIcon={actionIcon}
        />
        
        {/* Action Buttons */}
        <StationCardActions
          station={station}
          context={context}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison for better performance - exclude global isAddingToPlaylist from comparison
  return (
    prevProps.station.url === nextProps.station.url &&
    prevProps.station.name === nextProps.station.name &&
    prevProps.station.language === nextProps.station.language &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.station.isFavorite === nextProps.station.isFavorite &&
    prevProps.context === nextProps.context &&
    prevProps.actionIcon === nextProps.actionIcon &&
    prevProps.inPlaylist === nextProps.inPlaylist
    // Removed isAddingToPlaylist from comparison to prevent unnecessary re-renders
  );
});

StationCard.displayName = "StationCard";
