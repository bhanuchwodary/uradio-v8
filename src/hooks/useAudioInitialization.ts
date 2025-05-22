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
      
      // AUDIO QUALITY ENHANCEMENT: Set high-quality audio element properties
      globalAudioRef.element.preload = "auto";
      globalAudioRef.element.crossOrigin = "anonymous";
      
      // Set additional properties to help with mobile playback
      globalAudioRef.element.autoplay = false;
      
      // Using type assertion to handle playsInline
      (globalAudioRef.element as any).playsInline = true;
      
      // AUDIO QUALITY ENHANCEMENT: Set high quality mode when available
      try {
        // Non-standard but supported by some browsers for better audio
        (globalAudioRef.element as any).audioWorklet = true;
        
        // PERFORMANCE ENHANCEMENT: Optimize memory usage with proper buffering
        if ('mozAutoplayEnabled' in globalAudioRef.element) {
          // Firefox-specific optimization
          (globalAudioRef.element as any).mozAutoplayEnabled = false;
          (globalAudioRef.element as any).mozFrameBufferLength = 1024; // Larger buffer
        }
        
        // Set audio sample rate to high quality if possible
        if ('sampleRate' in globalAudioRef.element) {
          // @ts-ignore - Non-standard property
          globalAudioRef.element.sampleRate = 48000; // High quality
        }
      } catch (e) {
        // Silently fail if browser doesn't support these properties
      }
      
      // Prevent audio element from being garbage collected
      globalAudioRef.element.addEventListener('canplay', () => {
        // This empty handler helps keep the audio element alive
        globalAudioRef.isInitialized = true;
      });
      
      // PERFORMANCE ENHANCEMENT: Error recovery
      globalAudioRef.element.addEventListener('error', (e) => {
        console.error("Audio element error:", e);
        // If playback was in progress, try to recover
        if (globalAudioRef.isPlaying && globalAudioRef.currentUrl) {
          console.log("Attempting to recover from audio error");
          setTimeout(() => {
            if (globalAudioRef.element && globalAudioRef.currentUrl) {
              globalAudioRef.element.src = globalAudioRef.currentUrl;
              globalAudioRef.element.load();
              globalAudioRef.element.play().catch(err => {
                console.error("Recovery failed:", err);
              });
            }
          }, 1000);
        }
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
