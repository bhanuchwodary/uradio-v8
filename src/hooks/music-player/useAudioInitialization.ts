
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
      console.log("Creating new global audio element with strict no-autoplay policy");
      globalAudioRef.element = new Audio();
      globalAudioRef.element.preload = "none"; // CRITICAL: Changed from "auto" to "none"
      globalAudioRef.element.crossOrigin = "anonymous";
      
      // CRITICAL: Ensure no auto-play behavior
      globalAudioRef.element.autoplay = false;
      (globalAudioRef.element as any).playsInline = true;
      
      // Enhanced global event listeners with strict user interaction tracking
      globalAudioRef.element.addEventListener('play', () => {
        console.log("Audio element started playing - user initiated");
        globalAudioRef.isPlaying = true;
        globalAudioRef.isPaused = false;
      });
      
      globalAudioRef.element.addEventListener('pause', () => {
        console.log("Audio element paused");
        globalAudioRef.isPlaying = false;
        globalAudioRef.isPaused = true;
      });
      
      globalAudioRef.element.addEventListener('ended', () => {
        console.log("Audio element ended");
        globalAudioRef.isPlaying = false;
        globalAudioRef.isPaused = false;
      });
      
      globalAudioRef.element.addEventListener('error', (event) => {
        console.error("Audio element error:", event);
        globalAudioRef.isPlaying = false;
        globalAudioRef.isPaused = false;
      });
      
      // CRITICAL: Prevent any automatic loading
      globalAudioRef.element.addEventListener('loadstart', () => {
        console.log("Audio element started loading - ensuring no auto-play");
      });
      
      globalAudioRef.element.addEventListener('canplay', () => {
        console.log("Audio element can play - waiting for user interaction");
      });
      
      globalAudioRef.isInitialized = true;
    }

    // Set reference to the global audio element
    audioRef.current = globalAudioRef.element;
    
    // Set this instance as the active instance
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    // Set initial volume without triggering any loading
    if (audioRef.current) {
      audioRef.current.volume = volume;
      console.log("Set initial volume to:", volume);
    }

    console.log("Using global audio element - no auto-loading, no auto-play");
    
    return () => {
      console.log("Component unmounting, audio continues globally");
      // Don't reset anything here, let the audio continue
    };
  }, []); // Empty dependency array ensures this only runs once
};
