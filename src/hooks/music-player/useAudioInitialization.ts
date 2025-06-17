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
      
      // CRITICAL FIX: Enhanced global event listeners to prevent auto-playback
      globalAudioRef.element.addEventListener('play', () => {
        console.log("Audio element started playing");
        updateGlobalPlaybackState(true, false, false);
      });
      
      globalAudioRef.element.addEventListener('pause', (event) => {
        console.log("Audio element paused");
        // Check if this was triggered by user interaction or programmatically
        const isExplicitPause = !globalAudioRef.navigationInProgress;
        updateGlobalPlaybackState(false, true, isExplicitPause);
      });
      
      globalAudioRef.element.addEventListener('ended', () => {
        console.log("Audio element ended");
        updateGlobalPlaybackState(false, false, false);
        globalAudioRef.explicitlyPaused = false; // Reset on track end
      });
      
      // CRITICAL FIX: Add error handling to prevent auto-loading invalid URLs
      globalAudioRef.element.addEventListener('error', (event) => {
        console.error("Audio element error:", event);
        updateGlobalPlaybackState(false, false, false);
        // Don't auto-retry or auto-load on error
      });
      
      // CRITICAL FIX: Add loadstart listener to track when loading begins
      globalAudioRef.element.addEventListener('loadstart', () => {
        console.log("Audio element started loading");
        // This helps us track when loading is initiated
      });
      
      // Prevent audio element from being garbage collected
      globalAudioRef.element.addEventListener('canplay', () => {
        console.log("Audio element can play");
        // This empty handler helps keep the audio element alive
      });
      
      globalAudioRef.isInitialized = true;
    }

    // Set reference to the global audio element
    audioRef.current = globalAudioRef.element;
    
    // Set this instance as the active instance without recreating the audio element
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    // CRITICAL FIX: Set initial volume without triggering any audio loading
    if (audioRef.current) {
      audioRef.current.volume = volume;
      console.log("Set initial volume to:", volume);
    }

    console.log("Using existing global audio element for page:", window.location.pathname);
    
    // Signal that navigation is complete after a short delay
    const navigationTimer = setTimeout(() => {
      setNavigationState(false);
      console.log("Navigation state cleared");
    }, 100);
    
    return () => {
      clearTimeout(navigationTimer);
      console.log("Component unmounting, audio reference removed but playback continues");
      // Don't reset anything here, let the audio continue playing
    };
  }, []); // Empty dependency array ensures this only runs once
};
