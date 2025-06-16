
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  disabled: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying, onPlayPause, onNext, onPrev, disabled
}) => (
  <div className="flex justify-center gap-4">
    <Button
      variant="ghost"
      size="icon"
      onClick={onPrev}
      disabled={disabled}
      className={cn(
        "transition-all duration-200",
        // Standard themes
        !document.documentElement.classList.contains('metallic') && 
          "material-shadow-1 bg-secondary/80 hover:bg-secondary/95 hover:material-shadow-2 material-transition dark:bg-accent/80 dark:hover:bg-accent",
        // Metallic theme
        document.documentElement.classList.contains('metallic') && 
          "metallic-button hover:elevation-2"
      )}
    >
      <SkipBack className="w-5 h-5" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full h-12 w-12 ink-ripple transition-all duration-200",
        // Standard themes
        !document.documentElement.classList.contains('metallic') && 
          "bg-primary text-primary-foreground material-shadow-2 hover:material-shadow-3 material-transition",
        // Metallic theme
        document.documentElement.classList.contains('metallic') && (
          isPlaying 
            ? "metallic-button-primary playing elevation-4 scale-105" 
            : "metallic-button-primary elevation-3 hover:elevation-4 hover:scale-105"
        )
      )}
      onClick={onPlayPause}
      disabled={disabled}
    >
      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={onNext}
      disabled={disabled}
      className={cn(
        "transition-all duration-200",
        // Standard themes
        !document.documentElement.classList.contains('metallic') && 
          "material-shadow-1 bg-secondary/80 hover:bg-secondary/95 hover:material-shadow-2 material-transition dark:bg-accent/80 dark:hover:bg-accent",
        // Metallic theme
        document.documentElement.classList.contains('metallic') && 
          "metallic-button hover:elevation-2"
      )}
    >
      <SkipForward className="w-5 h-5" />
    </Button>
  </div>
);

export default PlayerControls;
