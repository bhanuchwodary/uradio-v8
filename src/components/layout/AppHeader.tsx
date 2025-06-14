
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";

interface AppHeaderProps {
  randomMode: boolean;
  setRandomMode: (rand: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  randomMode,
  setRandomMode,
  volume,
  setVolume
}) => {
  const { theme } = useTheme();
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Get track state for integrated player
  const {
    tracks,
    currentIndex,
    isPlaying,
    setCurrentIndex,
    setIsPlaying
  } = useTrackStateContext();

  // Use player core for player functionality
  const {
    loading,
    handlePlayPause,
    handleNext: originalHandleNext,
    handlePrevious: originalHandlePrevious,
  } = usePlayerCore({
    urls: tracks.map(track => track.url),
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });

  // Enhanced next/previous handlers for random mode
  const handleNext = () => {
    if (randomMode && tracks.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (randomIndex === currentIndex && tracks.length > 1);
      setCurrentIndex(randomIndex);
    } else {
      originalHandleNext();
    }
  };

  const handlePrevious = () => {
    if (randomMode && tracks.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (randomIndex === currentIndex && tracks.length > 1);
      setCurrentIndex(randomIndex);
    } else {
      originalHandlePrevious();
    }
  };

  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;

  // Determine which logo to use based on theme with preload
  const getLogoSrc = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = theme === "system" ? systemTheme : theme;
    return currentTheme === "light"
      ? "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png"
      : "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
  };

  // Preload both theme logos for instant switching
  useEffect(() => {
    const lightLogo = new window.Image();
    lightLogo.src = "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png";
    lightLogo.onload = () => setLogoLoaded(true);

    const darkLogo = new window.Image();
    darkLogo.src = "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
    darkLogo.onload = () => setLogoLoaded(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface-container/98 backdrop-blur-xl border-b border-outline-variant/20 z-20 ios-safe-top ios-safe-left ios-safe-right elevation-2">
      <div className="px-3 py-3">
        <div className="bg-gradient-to-r from-surface-container-high/60 to-surface-container-high/40 backdrop-blur-sm rounded-2xl border border-outline-variant/30 shadow-lg">
          {/* Responsive flex: column (mobile) and row (sm+) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center px-4 py-3 gap-3 sm:gap-4 w-full transition-all">
            {/* Logo and Station Info, stacked vertically on mobile */}
            <div className="w-full flex flex-col sm:flex-row items-center sm:items-center sm:w-auto flex-shrink-0 gap-2 sm:gap-0">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center justify-center mb-2 sm:mb-0">
                <img
                  src={getLogoSrc()}
                  alt="uRadio"
                  className={`h-10 w-auto object-contain transition-opacity duration-100 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              </div>
              {/* Station info (centered on mobile) */}
              {currentTrack ? (
                <div className="text-center sm:text-left flex flex-col sm:ml-4 w-full max-w-full">
                  <h3
                    className={cn(
                      "text-lg sm:text-base font-bold truncate leading-tight text-on-surface w-full sm:max-w-none",
                      "max-w-[85vw] sm:max-w-[28vw]"
                    )}
                    style={{
                      lineHeight: "1.15",
                      wordBreak: "break-word"
                    }}
                    title={currentTrack.name}
                  >
                    <span className="block whitespace-pre-line">
                      {currentTrack.name}
                    </span>
                  </h3>
                  <div className="flex justify-center sm:justify-start items-center gap-2 mt-1">
                    {loading && (
                      <p className="text-xs text-primary animate-pulse leading-tight">Loading...</p>
                    )}
                    {currentTrack.language && (
                      <span className="inline-block px-2 py-1 text-xs bg-primary/20 text-primary rounded-full font-medium">
                        {currentTrack.language}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center sm:text-left flex flex-col sm:ml-4 w-full max-w-full">
                  <p className="text-base font-medium text-on-surface-variant truncate max-w-[85vw] sm:max-w-none">
                    Select a station to start playing
                  </p>
                </div>
              )}
            </div>
            {/* Player controls, now full width on mobile under station info */}
            <div className="w-full sm:w-auto flex justify-center sm:justify-end items-center gap-2 mt-3 sm:mt-0">
              <MusicPlayer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                volume={volume}
                onVolumeChange={setVolume}
                loading={loading}
                compact={true}
              />
              {/* Random Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRandomMode(!randomMode)}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all duration-200 border ml-1 sm:ml-2",
                  randomMode
                    ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 shadow-sm"
                    : "bg-surface-container-high/60 border-outline-variant/30 hover:bg-surface-container-high/80 text-on-surface-variant hover:text-on-surface"
                )}
                title={randomMode ? "Random mode on" : "Random mode off"}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
