
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
    { icon: Music, label: "Playlist", path: "/" },
    { icon: List, label: "Stations", path: "/station-list" },
    { icon: Plus, label: "Add", path: "/add" },
    { icon: Mail, label: "Request", path: "/request-station" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background ios-scrolling">
      {/* Modern Header - Streamlined design */}
      <header className="fixed top-0 left-0 right-0 glass-elevated z-20 ios-safe-area">
        <div className="container-modern py-3">
          {/* Clean Player Integration */}
          <div className="glass-surface rounded-2xl overflow-hidden">
            {currentTrack ? (
              <div className="flex items-center px-4 py-3 gap-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src={getLogoSrc()}
                    alt="uRadio" 
                    className={cn(
                      "h-8 w-auto object-contain transition-opacity duration-200",
                      logoLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </div>
                
                {/* Station Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-on-surface truncate">
                    {currentTrack.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {loading && (
                      <p className="text-xs text-primary animate-pulse">Loading...</p>
                    )}
                    {currentTrack.language && (
                      <span className="inline-block px-1.5 py-0.5 text-xs bg-primary/15 text-primary rounded-md font-medium">
                        {currentTrack.language}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Controls */}
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
                      "h-8 w-8 rounded-lg transition-modern",
                      randomMode 
                        ? "bg-primary/20 text-primary hover:bg-primary/30" 
                        : "hover:bg-surface-container-high text-on-surface-variant"
                    )}
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center px-4 py-3 gap-4">
                <div className="flex-shrink-0">
                  <img 
                    src={getLogoSrc()}
                    alt="uRadio" 
                    className={cn(
                      "h-8 w-auto object-contain transition-opacity duration-200",
                      logoLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface-variant">
                    Select a station to start playing
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRandomMode(!randomMode)}
                  className={cn(
                    "h-8 w-8 rounded-lg transition-modern",
                    randomMode 
                      ? "bg-primary/20 text-primary hover:bg-primary/30" 
                      : "hover:bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow pt-20 pb-20 px-4 container-modern ios-scrolling">
        {children}
      </main>
      
      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-elevated z-10 mobile-optimized">
        <div className="container-modern py-2">
          <div className="flex justify-between items-center">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="flex-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-1 w-full transition-modern rounded-xl ios-touch-optimized",
                    path === item.path 
                      ? "text-primary bg-primary/10" 
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                  )}
                >
                  <item.icon className={cn(
                    "transition-modern", 
                    path === item.path ? "h-5 w-5" : "h-4 w-4"
                  )} />
                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </Button>
              </Link>
            ))}
            
            <div className="flex-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
