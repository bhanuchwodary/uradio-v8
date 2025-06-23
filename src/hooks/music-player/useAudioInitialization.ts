// src/hooks/music-player/useAudioInitialization.ts
import { useEffect } from "react";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger"; // Assuming logger is available

interface UseAudioInitializationProps {
  volume: number;
}

export const useAudioInitialization = ({ volume }: UseAudioInitializationProps) => {
  useEffect(() => {
    if (!globalAudioRef.element) {
      logger.info("Creating new global audio element.");
      const audio = new Audio();
      audio.preload = "none";
      audio.crossOrigin = "anonymous";
      audio.autoplay = false; // Ensure no auto-play
      audio.volume = volume; // Set initial volume

      globalAudioRef.element = audio;

      // Add error listener for global audio element
      const handleError = (e: Event) => {
        logger.error("Global Audio Element Error:", e);
        // Consider more specific error handling here, e.g., toast message
      };
      globalAudioRef.element.addEventListener('error', handleError);

      return () => {
        // Clean up error listener on unmount
        if (globalAudioRef.element) {
          globalAudioRef.element.removeEventListener('error', handleError);
          // Do NOT destroy globalAudioRef.element here, as it's meant to be global.
          // Cleanup should only involve listeners attached within this specific effect.
        }
      };
    } else {
      // If element already exists, ensure its volume is correctly set
      globalAudioRef.element.volume = volume;
      logger.debug("Global audio element already exists, updated volume.");
    }
  }, [volume]);
};
