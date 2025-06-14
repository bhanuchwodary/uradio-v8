
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus, Mail, Shuffle } from "lucide-react";
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
  const [randomMode, setRandomMode] = useState(false);
  
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
    const lightLogo = new Image();
    lightLogo.src = "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png";
    lightLogo.onload = () => setLogoLoaded(true);
    
    const darkLogo = new Image();
    darkLogo.src = "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
    darkLogo.onload = () => setLogoLoaded(true);
  }, []);
  
  const navItems = [
    { icon: List, label: "Stations", path: "/" },
    { icon: Plus, label: "Add", path: "/add" },
    { icon: Music, label: "Playlist", path: "/playlist" },
    { icon: Mail, label: "Request", path: "/request-station" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low dark:bg-background ios-vh-fix ios-no-bounce">
      {/* Redesigned Header - Now with integrated logo and player */}
      <header className="fixed top-0 left-0 right-0 bg-surface-container/80 dark:bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 z-20 ios-safe-top ios-safe-left ios-safe-right">
        <div className="px-3 py-2">
          <div className="bg-surface-container-high/50 dark:bg-surface-container/50 backdrop-blur-sm rounded-2xl border border-outline-variant/20">
            {currentTrack ? (
              <div className="flex items-center px-3 py-2 gap-3">
                <div className="flex-shrink-0">
                  <img 
                    src={getLogoSrc()}
                    alt="uRadio" 
                    className={`h-9 w-auto object-contain transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
                
                <div className="w-px h-8 bg-outline-variant/30"></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-on-surface truncate">
                        {currentTrack.name}
                      </h3>
                      {loading && (
                          <p className="text-xs text-primary animate-pulse">Loading...</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
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
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRandomMode(!randomMode)}
                    className={cn(
                      "h-9 w-9 rounded-full transition-all duration-200",
                      randomMode 
                        ? "bg-primary/20 text-primary hover:bg-primary/30" 
                        : "text-on-surface-variant hover:bg-surface-container-highest"
                    )}
                    title={randomMode ? "Random mode on" : "Random mode off"}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center px-4 py-3 gap-4">
                <div className="flex-shrink-0">
                  <img 
                    src={getLogoSrc()}
                    alt="uRadio" 
                    className={`h-10 w-auto object-contain transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
                
                <div className="w-px h-8 bg-outline-variant/30"></div>
                
                <div className="flex-1">
                  <p className="text-base font-medium text-on-surface-variant">
                    Select a station
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content - Adjusted padding for new header height */}
      <main className="flex-grow pt-24 pb-28 px-3 w-full ios-smooth-scroll ios-safe-left ios-safe-right">
        {children}
      </main>
      
      {/* Enhanced Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-container/80 dark:bg-surface-container-low/80 backdrop-blur-xl border-t border-outline-variant/30 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
        <div className="flex justify-around items-center h-16">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="flex-1 flex justify-center items-center h-full">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-out text-on-surface-variant rounded-full",
                    path === item.path && "text-primary"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-300 w-16 h-8",
                    path === item.path && "bg-primary/20"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium tracking-wide">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
            
            <div className="flex-1 flex justify-center items-center h-full">
              <ThemeToggle />
            </div>
        </div>
      </nav>
    </div>
  );
};

