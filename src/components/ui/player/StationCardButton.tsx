
import React from "react";
import { Play, Pause, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { StationCardButtonProps } from "./types";

export const StationCardButton: React.FC<StationCardButtonProps> = ({
  station,
  isPlaying,
  actionIcon,
  inPlaylist,
  isAddingToPlaylist,
  onClick,
  isDisabled,
  isProcessing
}) => {
  // Determine the main action icon based on context and playlist status
  const ActionIcon = actionIcon === "add" 
    ? (inPlaylist ? Check : Plus) 
    : (isPlaying ? Pause : Play);

  return (
    <ActionIcon className={cn(
      "transition-transform duration-200 w-3 h-3",
      actionIcon !== "add" && !isPlaying && "ml-0.5",
    )} />
  );
};
