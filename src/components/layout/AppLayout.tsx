
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus, Mail } from "lucide-react";
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
    const lightLogo = new Image();
    lightLogo.src = "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png";
    lightLogo.onload = () => setLogoLoaded(true);
    
    const darkLogo = new Image();
    darkLogo.src = "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
    darkLogo.onload = () => setLogoLoaded(true);
  }, []);
  
  const navItems = [
    { icon: Music, label: "Playlist", path: "/" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add" },
    { icon: Mail, label: "Request", path: "/request-station" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce">
      {/* Header with proper vertical alignment */}
      <header className="fixed top-0 left-0 right-0 bg-surface-container/95 backdrop-blur-xl border-b border-outline-variant/30 z-20 ios-safe-top ios-safe-left ios-safe-right elevation-3">
        <div className="container mx-auto px-0">
          <div className="flex items-center justify-center h-16 sm:h-16">
            {/* Logo with proper centering */}
            <div className="flex items-center justify-center flex-shrink-0 w-20 sm:w-24">
              <img 
                src={getLogoSrc()}
                alt="uRadio Logo" 
                className={`h-12 w-auto sm:h-14 object-contain transition-opacity duration-100 ease-in-out ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            
            {/* Extended Player with proper centering */}
            <div className="flex-1 mx-2 flex items-center justify-center">
              {currentTrack && (
                <div className="w-full bg-surface-container-high/60 backdrop-blur-md rounded-lg">
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
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className={cn(
        "flex-grow p-3 sm:p-4 pb-32 md:pb-28 overflow-x-hidden container mx-auto w-full ios-smooth-scroll ios-safe-left ios-safe-right px-0 sm:px-0 lg:px-0",
        "pt-20 sm:pt-20"
      )}>
        {children}
      </main>
      
      {/* FIXED Enhanced Bottom Navigation with matching width and equal button sizes */}
      <nav className="fixed bottom-0 left-0 right-0 p-2 sm:p-3 bg-surface-container/98 backdrop-blur-xl border-t border-outline-variant/20 elevation-3 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
        <div className="container mx-auto px-0">
          <div className="flex justify-between items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="flex-1">
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
            
            {/* FIXED Theme Toggle to match other footer buttons exactly */}
            <div className="flex-1">
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1.5 h-auto py-3 px-2 w-full transition-all duration-200 ease-out bg-transparent ios-touch-target rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 active:bg-primary-container/20"
              >
                <div className="h-5 w-5 hover:scale-105 transition-all duration-200 ease-out">
                  <ThemeToggle />
                </div>
                <span className="text-xs transition-all duration-200 ease-out font-medium opacity-90">
                  Theme
                </span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
