
import { useEffect } from 'react';
import { globalAudioRef } from '@/components/music-player/audioInstance';

export const usePhoneCallHandling = (isPlaying: boolean, setIsPlaying: (playing: boolean) => void) => {
  useEffect(() => {
    let wasPlayingBeforeInterruption = false;

    // Function to handle audio interruptions (like phone calls)
    const handleAudioInterruption = () => {
      if (globalAudioRef.element) {
        wasPlayingBeforeInterruption = !globalAudioRef.element.paused;
        if (wasPlayingBeforeInterruption) {
          setIsPlaying(false);
          console.log('Audio paused due to interruption');
        }
      }
    };

    // Function to handle audio resume after interruption
    const handleAudioResume = () => {
      if (wasPlayingBeforeInterruption && globalAudioRef.element) {
        setIsPlaying(true);
        console.log('Audio resumed after interruption');
        wasPlayingBeforeInterruption = false;
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('pause', handleAudioInterruption);
      document.addEventListener('resume', handleAudioResume);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('pause', handleAudioInterruption);
        document.removeEventListener('resume', handleAudioResume);
      }
    };
  }, [setIsPlaying]);
};
