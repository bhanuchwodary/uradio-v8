
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { useAppPlayer } from '@/hooks/useAppPlayer';

const AppHeader: React.FC = () => {
    const { theme } = useTheme();
    const [logoLoaded, setLogoLoaded] = useState(false);

    const {
        currentTrack,
        isPlaying,
        loading,
        volume,
        setVolume,
        handlePlayPause,
        handleNext,
        handlePrevious,
        randomMode,
        setRandomMode,
        tracks
    } = useAppPlayer();

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

    return (
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
    );
};

export default AppHeader;
