
import { useEffect } from "react";
import { globalAudioRef } from "@/components/music-player/audioInstance";

interface UseAudioInitializationProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  playerInstanceRef: React.MutableRefObject<Symbol>;
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
