
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

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
      className="bg-primary/15 hover:bg-primary/25 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <SkipBack className="w-6 h-6" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      className="rounded-full bg-primary text-primary-foreground"
      onClick={onPlayPause}
      disabled={disabled}
    >
      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={onNext}
      disabled={disabled}
      className="bg-primary/15 hover:bg-primary/25 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <SkipForward className="w-6 h-6" />
    </Button>
  </div>
);

export default PlayerControls;
