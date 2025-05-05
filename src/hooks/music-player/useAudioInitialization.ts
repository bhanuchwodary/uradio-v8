import { useEffect } from "react";
import { globalAudioRef } from "@/components/music-player/audioInstance";

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

    // Log that we're using the existing audio element instead of creating a new one
    console.log("Using existing global audio element for page:", window.location.pathname);
    
    // This is crucial - we're not cleaning up the audio element on unmount
    // to maintain continuous playback between page navigations
    return () => {
      console.log("Component unmounting, audio reference removed but playback continues");
      // Don't reset anything here, let the audio continue playing
    };
  }, []); // Empty dependency array ensures this only runs once
};
