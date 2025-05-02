
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
    // Create audio element if it doesn't exist
    if (!globalAudioRef.element) {
      globalAudioRef.element = new Audio();
      globalAudioRef.element.preload = "auto";
      globalAudioRef.element.crossOrigin = "anonymous";
    }

    // Set reference to the global audio element
    audioRef.current = globalAudioRef.element;
    
    // Set this instance as the active instance
    globalAudioRef.activePlayerInstance = playerInstanceRef;
    
    // Set initial volume
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    return () => {
      // Nothing to clean up here
    };
  }, [audioRef, playerInstanceRef, volume]);
};
