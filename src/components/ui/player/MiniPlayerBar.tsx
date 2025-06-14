
import React from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppPlayer } from "@/hooks/useAppPlayer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MiniPlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    volume,
    setVolume
  } = useAppPlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-[3.5rem] left-0 right-0 z-20 ios-safe-bottom pointer-events-none">
      <Card className="max-w-xl mx-auto bg-surface-container-lowest/90 backdrop-blur-md border-border/30 rounded-2xl shadow-2xl pointer-events-auto animate-fade-in">
        <div className="flex items-center px-3 py-2 gap-3 min-h-[56px]">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-on-surface text-sm truncate">{currentTrack.name}</div>
            <div className="text-xs text-on-surface-variant truncate">{currentTrack.language || 'Unknown'}</div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="rounded-full hover:bg-surface-container-high"
              title="Previous station"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              disabled={loading}
              className={cn(
                "rounded-full shadow bg-primary text-primary-foreground focus:ring-2 focus:ring-primary/40 active:scale-95 transition-transform duration-200",
                isPlaying && "animate-pulse"
              )}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="rounded-full hover:bg-surface-container-high"
              title="Next station"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MiniPlayerBar;

