
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, List, Plus, Mail, Shuffle, Menu, X } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
  
  // Determine which logo to use based on theme
  const getLogoSrc = () => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    return currentTheme === "light" 
      ? "/lovable-uploads/92c8140b-84fe-439c-a2f8-4d1758ab0998.png" 
      : "/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png";
  };

  // Preload logos
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
    <div className="min-h-screen flex flex-col gradient-surface ios-vh-fix ios-smooth-scroll">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-20 ios-safe-top ios-safe-left ios-safe-right">
        <div className="glass-light dark:glass-dark">
          <div className="px-4 py-3">
            {/* Mobile Header */}
            <div className="flex md:hidden items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={getLogoSrc()}
                  alt="uRadio" 
                  className={cn(
                    "h-8 w-auto object-contain transition-opacity duration-200",
                    logoLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="h-6 w-px bg-outline-variant/30"></div>
                <h1 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                  uRadio
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10 rounded-xl"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src={getLogoSrc()}
                  alt="uRadio" 
                  className={cn(
                    "h-10 w-auto object-contain transition-opacity duration-200",
                    logoLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <div className="h-8 w-px bg-outline-variant/30"></div>
                <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                  uRadio
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="flex-1">
                <div className="flex items-center gap-2">
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl transition-smooth",
                          path === item.path 
                            ? "bg-primary/10 text-primary shadow-sm" 
                            : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRandomMode(!randomMode)}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-smooth",
                    randomMode 
                      ? "bg-primary/20 text-primary shadow-sm" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                  title={randomMode ? "Random mode on" : "Random mode off"}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                <ThemeToggle />
              </div>
            </div>

            {/* Current Track Info - Modern Design */}
            {currentTrack && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-tertiary/5 border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface truncate">
                      {currentTrack.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {loading && (
                        <span className="text-xs text-primary animate-pulse">Loading...</span>
                      )}
                      {currentTrack.language && (
                        <span className="inline-block px-2 py-1 text-xs bg-primary/20 text-primary rounded-full font-medium">
                          {currentTrack.language}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
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
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="fixed top-0 right-0 h-full w-80 glass-light dark:glass-dark p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-10 w-10 rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 p-4 rounded-xl transition-smooth",
                      path === item.path 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRandomMode(!randomMode)}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-smooth",
                    randomMode 
                      ? "bg-primary/20 text-primary shadow-sm" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
                <span className="text-sm text-on-surface-variant">
                  Random mode {randomMode ? 'on' : 'off'}
                </span>
              </div>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className={cn(
        "flex-grow overflow-x-hidden ios-smooth-scroll ios-safe-left ios-safe-right",
        currentTrack ? "pt-40 md:pt-36" : "pt-28 md:pt-24",
        "pb-4 px-4"
      )}>
        <div className="responsive-container">
          {children}
        </div>
      </main>
    </div>
  );
}
