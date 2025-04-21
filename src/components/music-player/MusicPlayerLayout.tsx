
import React from "react";
import TrackInfo from "@/components/music-player/TrackInfo";
import SliderWithLabels from "@/components/music-player/SliderWithLabels";
import PlayerControls from "@/components/music-player/PlayerControls";
import VolumeControl from "@/components/music-player/VolumeControl";
import { Card, CardContent } from "@/components/ui/card";

interface MusicPlayerLayoutProps {
  trackTitle: string;
  trackUrl?: string;
  loading: boolean;
  currentTime: number;
  duration: number;
  onSeek: (v: number[]) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  setVolume: (v: number) => void;
  // Responsive prop for maxHeight
  className?: string;
}

const MusicPlayerLayout: React.FC<MusicPlayerLayoutProps> = ({
  trackTitle,
  trackUrl,
  loading,
  currentTime,
  duration,
  onSeek,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  volume,
  setVolume,
  className = "",
}) => (
  <Card
    className={[
      "w-full mx-auto rounded-xl border-none shadow-lg glass",
      "flex flex-col justify-between",
      "bg-white/20 dark:bg-black/20",
      "min-h-[260px] max-w-2xl",
      "md:min-h-[330px] md:max-h-[410px]",
      "h-full", // allow it to fill grid
      className,
    ].join(" ")}
    style={{
      flex: "1 1 0",
      minHeight: "16rem",
      maxHeight: "32rem",
    }}
  >
    <CardContent className="p-4 h-full flex flex-col gap-4 justify-center">
      <TrackInfo title={trackTitle} url={trackUrl} loading={loading} />
      <div className="flex-1 flex flex-col justify-between">
        <SliderWithLabels
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
          disabled={!duration || duration === Infinity}
        />
        <div className="flex flex-col md:flex-row items-center gap-4 pt-2">
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onNext={onNext}
            onPrev={onPrev}
            disabled={!trackUrl}
          />
          <div className="w-full md:w-auto flex-1 flex justify-center">
            <VolumeControl volume={volume} setVolume={setVolume} />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default MusicPlayerLayout;
