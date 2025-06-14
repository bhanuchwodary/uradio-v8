
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
    <div className="min-h-screen flex flex-col bg-background text-on-surface ios-vh-fix ios-no-bounce">
      {/* Redesigned Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-b border-outline-variant/30 z-20 ios-safe-top ios-safe-left ios-safe-right">
        <div className="container mx-auto px-3 py-2.5">
          <div className="flex items-center gap-4 h-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src={getLogoSrc()}
                alt="uRadio" 
                className={`h-9 w-auto object-contain transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          
            {currentTrack ? (
              <>
                {/* Station Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-on-surface truncate">
                    {currentTrack.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    {loading ? "Loading..." : "Now Playing"}
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
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
                      "h-9 w-9 rounded-full transition-colors duration-200",
                      randomMode 
                        ? "bg-primary/20 text-primary" 
                        : "text-on-surface-variant hover:bg-surface-container"
                    )}
                    title={randomMode ? "Random mode on" : "Random mode off"}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 text-center">
                <p className="text-on-surface-variant">Select a station to begin</p>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content - Adjusted padding for new header height */}
      <main className={cn(
        "flex-grow px-3 pb-28 pt-20 container mx-auto w-full ios-smooth-scroll",
        "ios-safe-left ios-safe-right"
      )}>
        {children}
      </main>
      
      {/* Redesigned Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-outline-variant/30 z-10 bottom-nav-ios ios-safe-left ios-safe-right">
        <div className="container mx-auto px-2 py-1.5">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="flex-1 flex justify-center">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-3 w-auto transition-all duration-300 ease-out rounded-xl",
                    path === item.path || (item.path === "/" && path === "/playlist")
                      ? "text-on-primary-container bg-primary-container" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[11px] font-medium">
                    {item.label}
                  </span>
                </Button>
              </Link>
            ))}
            
            <div className="flex-1 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
