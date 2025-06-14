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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container dark:from-surface-dim dark:via-surface dark:to-surface-bright ios-vh-fix ios-no-bounce">
      {/* Ultra Compact Header */}
      <header className="fixed top-0 left-0 right-0 bg-surface-container/95 backdrop-blur-lg border-b border-outline-variant/20 z-20 ios-safe-top ios-safe-left ios-safe-right elevation-1">
        <div className="p-1.5">
          <div className="bg-gradient-to-r from-surface-container-high/50 to-surface-container-high/30 backdrop-blur-sm rounded-lg border border-outline-variant/20 shadow-sm">
            {currentTrack ? (
              <>
                {/* Mobile Layout: Single compact row */}
                <div className="flex items-center p-2 gap-2 md:hidden">
                  {/* Mini Logo */}
                  <div className="flex-shrink-0">
                    <img 
                      src={getLogoSrc()}
                      alt="uRadio" 
                      className={`h-6 w-auto object-contain transition-opacity duration-100 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </div>
                  
                  {/* Station Info - Ultra Compact */}
                  <div className="flex-1 min-w-0 mx-1">
                    <h3 className="text-xs font-semibold text-on-surface truncate leading-none">
                      {currentTrack.name}
                    </h3>
                    {loading && (
                      <p className="text-xs text-primary animate-pulse leading-none mt-0.5">Loading...</p>
                    )}
                  </div>
                  
                  {/* Compact Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
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
                    
                    {/* Mini Random Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRandomMode(!randomMode)}
                      className={cn(
                        "h-6 w-6 rounded-md transition-all duration-200 border flex-shrink-0",
                        randomMode 
                          ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30" 
                          : "bg-surface-container-high/50 border-outline-variant/20 hover:bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface"
                      )}
                      title={randomMode ? "Random mode on" : "Random mode off"}
                    >
                      <Shuffle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Desktop Layout: Horizontal compact layout */}
                <div className="hidden md:flex md:items-center md:gap-3 md:p-2.5">
                  {/* Logo - Desktop */}
                  <div className="flex-shrink-0">
                    <img 
                      src={getLogoSrc()}
                      alt="uRadio" 
                      className={`h-8 w-auto object-contain transition-opacity duration-100 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </div>
                  
                  {/* Subtle separator */}
                  <div className="w-px h-5 bg-outline-variant/20"></div>
                  
                  {/* Station Info - Desktop */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-on-surface truncate leading-tight">
                      {currentTrack.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {loading && (
                        <p className="text-xs text-primary animate-pulse leading-tight">Loading...</p>
                      )}
                      {currentTrack.language && (
                        <span className="inline-block px-1.5 py-0.5 text-xs bg-primary/15 text-primary rounded-md font-medium">
                          {currentTrack.language}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Player Controls - Desktop */}
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
                    
                    {/* Random Mode Toggle - Desktop */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRandomMode(!randomMode)}
                      className={cn(
                        "h-8 w-8 rounded-lg transition-all duration-200 border",
                        randomMode 
                          ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30" 
                          : "bg-surface-container-high/50 border-outline-variant/20 hover:bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface"
                      )}
                      title={randomMode ? "Random mode on" : "Random mode off"}
                    >
                      <Shuffle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center px-2 py-2 gap-2">
                {/* Mini Logo */}
                <div className="flex-shrink-0">
                  <img 
                    src={getLogoSrc()}
                    alt="uRadio" 
                    className={`h-6 w-auto object-contain transition-opacity duration-100 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
                
                {/* No station message - ultra compact */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-on-surface-variant truncate">
                    Select a station to start
                  </p>
                </div>
                
                {/* Random Mode Toggle - Mini */}
                <div className="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRandomMode(!randomMode)}
                    className={cn(
                      "h-6 w-6 rounded-md transition-all duration-200 border",
                      randomMode 
                        ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30" 
                        : "bg-surface-container-high/50 border-outline-variant/20 hover:bg-surface-container-high/70 text-on-surface-variant hover:text-on-surface"
                    )}
                    title={randomMode ? "Random mode on" : "Random mode off"}
                  >
                    <Shuffle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content - Reduced top padding to prevent overlap */}
      <main className={cn(
        "flex-grow px-3 pb-32 md:pb-28 overflow-x-hidden container mx-auto w-full ios-smooth-scroll ios-safe-left ios-safe-right",
        "pt-14"
      )}>
        {children}
      </main>
      
      {/* Bottom Navigation - unchanged */}
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
            
            <div className="flex-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
