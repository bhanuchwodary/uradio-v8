
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { usePlayerCore } from "@/hooks/usePlayerCore";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const { theme } = useTheme();
  
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
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
  } = usePlayerCore({
    urls: tracks.map(track => track.url),
    currentIndex,
    setCurrentIndex,
    isPlaying,
    setIsPlaying,
    tracks
  });
  
  // Calculate current track
  const currentTrack = tracks[currentIndex] || null;
  
  // Determine which logo to use based on theme
  const getLogoSrc = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    return currentTheme === "light" 
      ? "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png" 
      : "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
  };
  
  const navItems = [
    { icon: Music, label: "Playlist", path: "/" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce">
      {/* Compact Header with Integrated Player */}
      <header className="fixed top-0 left-0 right-0 bg-surface-container/98 backdrop-blur-xl border-b border-outline-variant/30 z-20 ios-safe-top ios-safe-left ios-safe-right elevation-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single row with logo, player, and theme toggle */}
          <div className="flex items-center justify-between py-3 sm:py-4 h-16 sm:h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 w-16 sm:w-20">
              <img 
                src={getLogoSrc()}
                alt="uRadio Logo" 
                className="h-10 w-auto sm:h-12 object-contain transition-opacity duration-300 ease-out"
              />
            </div>
            
            {/* Compact Player - Center */}
            <div className="flex-1 max-w-2xl mx-4">
              {currentTrack && (
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
              )}
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center flex-shrink-0 w-16 sm:w-20 justify-end">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content with adjusted spacing */}
      <main className={cn(
        "flex-grow p-3 sm:p-4 pb-32 md:pb-28 overflow-x-hidden max-w-7xl mx-auto w-full ios-smooth-scroll ios-safe-left ios-safe-right px-4 sm:px-6 lg:px-8",
        "pt-20 sm:pt-20" // Reduced padding to account for smaller header
      )}>
        {children}
      </main>
      
      {/* Enhanced Bottom Navigation with Material Design 3 */}
      <nav className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 bg-surface-container/98 backdrop-blur-xl border-t border-outline-variant/20 elevation-3 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
        <div className="max-w-screen-lg mx-auto flex justify-around items-center">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative flex-1">
              <Button
                variant="ghost"
                className={cn(
                  "flex flex-col items-center gap-1.5 h-auto py-3 px-2 w-full transition-all duration-200 ease-out bg-transparent ios-touch-target rounded-xl",
                  path === item.path 
                    ? "text-primary bg-primary-container/40 after:absolute after:bottom-1 after:left-1/4 after:w-1/2 after:h-1 after:bg-primary after:rounded-full after:shadow-sm" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 active:bg-primary-container/20"
                )}
              >
                <item.icon className={cn(
                  "transition-all duration-200 ease-out", 
                  path === item.path ? "h-6 w-6 scale-110" : "h-5 w-5 hover:scale-105"
                )} />
                <span className={cn(
                  "text-xs transition-all duration-200 ease-out font-medium",
                  path === item.path ? "opacity-100 font-semibold" : "opacity-90"
                )}>
                  {item.label}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
