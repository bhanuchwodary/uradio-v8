import { useEffect } from "react";
import { globalAudioRef, updateGlobalPlaybackState, setNavigationState } from "@/components/music-player/audioInstance";

interface UseAudioInitializationProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  playerInstanceRef: React.MutableRefObject<symbol>;
  volume: number;
}

export const useAudioInitialization = ({
  audioRef,
  playerInstanceRef,
  volume
}: UseAudioInitializationProps) => {
  useEffect(() => {
    // Set navigation state when component mounts
    setNavigationState(true);
    
    // Create audio element if it doesn't exist (should only happen once globally)
    if (!globalAudioRef.element) {
      console.log("Creating new global audio element");
      globalAudioRef.element = new Audio();
      globalAudioRef.element.preload = "auto";
      globalAudioRef.element.crossOrigin = "anonymous";
      
      // Set additional properties to help with mobile playback
      globalAudioRef.element.autoplay = false;
      // Using type assertion to handle playsInline
      (globalAudioRef.element as any).playsInline = true;
      
      // Enhanced global event listeners to track explicit user actions
      globalAudioRef.element.addEventListener('play', () => {
        updateGlobalPlaybackState(true, false, false);
      });
      
      globalAudioRef.element.addEventListener('pause', (event) => {
        // Check if this was triggered by user interaction or programmatically
        const isExplicitPause = !globalAudioRef.navigationInProgress;
        updateGlobalPlaybackState(false, true, isExplicitPause);
      });
      
      globalAudioRef.element.addEventListener('ended', () => {
        updateGlobalPlaybackState(false, false, false);
        globalAudioRef.explicitlyPaused = false; // Reset on track end
      });
      
      // Prevent audio element from being garbage collected
      globalAudioRef.element.addEventListener('canplay', () => {
        // This empty handler helps keep the audio element alive
      });
      
      globalAudioRef.isInitialized = true;
    }

    // Set reference to the global audio element
    audioRef.current = globalAudioRef.element;
    
    // Set this instance as the active instance without recreating the audio element
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    // Set initial volume without reloading the audio
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    console.log("Using existing global audio element for page:", window.location.pathname);
    
    // Signal that navigation is complete after a short delay
    const navigationTimer = setTimeout(() => {
      setNavigationState(false);
    }, 100);
    
    return () => {
      clearTimeout(navigationTimer);
      console.log("Component unmounting, audio reference removed but playback continues");
      // Don't reset anything here, let the audio continue playing
    };
  }, []); // Empty dependency array ensures this only runs once
};
