
import { useCallback, useRef } from 'react';
import { createRippleEffect } from '@/utils/animations';
import { logger } from '@/utils/logger';

interface UseEnhancedInteractionsOptions {
  enableRipple?: boolean;
  enableHaptic?: boolean;
  enableSoundFeedback?: boolean;
}

export const useEnhancedInteractions = ({
  enableRipple = true,
  enableHaptic = true,
  enableSoundFeedback = false
}: UseEnhancedInteractionsOptions = {}) => {
  const audioContext = useRef<AudioContext | null>(null);

  const playClickSound = useCallback(() => {
    if (!enableSoundFeedback) return;
    
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = audioContext.current.createOscillator();
      const gainNode = audioContext.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.current.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.current.currentTime + 0.1);
      
      oscillator.start(audioContext.current.currentTime);
      oscillator.stop(audioContext.current.currentTime + 0.1);
    } catch (error) {
      logger.warn('Failed to play click sound', error);
    }
  }, [enableSoundFeedback]);

  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptic) return;
    
    try {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30]
        };
        navigator.vibrate(patterns[intensity]);
      }
    } catch (error) {
      logger.warn('Failed to trigger haptic feedback', error);
    }
  }, [enableHaptic]);

  const handleInteraction = useCallback((
    event: React.MouseEvent<HTMLElement>,
    options: {
      hapticIntensity?: 'light' | 'medium' | 'heavy';
      playSound?: boolean;
    } = {}
  ) => {
    const element = event.currentTarget;
    
    // Ripple effect
    if (enableRipple && element) {
      createRippleEffect(element, event.nativeEvent);
    }
    
    // Haptic feedback
    triggerHapticFeedback(options.hapticIntensity);
    
    // Sound feedback
    if (options.playSound) {
      playClickSound();
    }
  }, [enableRipple, triggerHapticFeedback, playClickSound]);

  return {
    handleInteraction,
    triggerHapticFeedback,
    playClickSound
  };
};
