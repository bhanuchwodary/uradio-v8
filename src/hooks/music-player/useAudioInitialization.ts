
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

    // This is crucial - we're not cleaning up the audio element on unmount
    // to maintain continuous playback between page navigations
    return () => {
      console.log("Component unmounting, audio reference removed but playback continues");
    };
  }, []); // Empty dependency array ensures this only runs once
};
