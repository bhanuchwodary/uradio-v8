
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Radio, 
  List, 
  Plus,
  Volume2,
  VolumeX
} from "lucide-react";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.7);
  
  const { 
    tracks, 
    currentIndex, 
    isPlaying, 
    setCurrentIndex, 
    setIsPlaying 
  } = useTrackStateContext();
  
  const {
    loading,
    volume,
    setVolume,
    handlePlayPause,
    handleNext,
    handlePrevious
  } = useMusicPlayer();

  // Get current track from context instead of useMusicPlayer hook
  const currentTrack = tracks[currentIndex] || null;

  // Mute functionality
  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  // Update muted state when volume changes externally
  useEffect(() => {
    if (volume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (volume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [volume, isMuted]);

  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/station-list", label: "Stations", icon: Radio },
    { path: "/playlist", label: "Playlist", icon: List },
    { path: "/add-station", label: "Add", icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 flex flex-col">
      {/* Header - FIXED: Consistent width with container max-w-5xl */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Streamify
            </h1>
            
            {/* Quick mute button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className="h-9 w-9"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        {children || <Outlet />}
      </main>

      {/* Mini Player - Only show when there's a track loaded */}
      {currentTrack && (
        <div className="border-t border-border/30 bg-background/95 backdrop-blur-md">
          <div className="container mx-auto max-w-5xl px-4 py-3">
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
          </div>
        </div>
      )}

      {/* Footer Navigation - FIXED: Same width as header with container max-w-5xl */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto max-w-5xl px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 h-10 px-3 text-sm font-medium transition-colors",
                      isActive 
                        ? "text-foreground bg-accent/50" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                );
              })}
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
};
