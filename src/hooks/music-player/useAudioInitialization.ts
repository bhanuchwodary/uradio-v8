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
    }

    // Set reference to the global audio element
    audioRef.current = globalAudioRef.element;
    
    // Set this instance as the active instance without recreating the audio element
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    // Set initial volume without reloading the audio
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    return () => {
      // Instead of destroying the audio element, we'll just remove the reference
      // but keep the global audio element playing
      console.log("Component unmounting, audio reference removed but playback continues");
    };
  }, [audioRef, playerInstanceRef, volume]);
};
