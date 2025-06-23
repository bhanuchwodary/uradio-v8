import { useEffect } from "react";
import androidAutoService from "../services/androidAutoService";
import audioWakeLockService from "../services/audioWakeLockService";
import { Track } from "@/types/track";

interface UseMediaSessionProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  trackDuration: number;
  trackPosition: number;
  setIsPlaying: (playing: boolean) => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSeek: (position: number) => void;
  randomMode?: boolean;
}

export const useMediaSession = ({
  tracks,
  currentIndex,
  isPlaying,
  trackDuration,
  trackPosition,
  setIsPlaying,
  onSkipNext,
  onSkipPrevious,
  onSeek,
  randomMode = false,
}: UseMediaSessionProps) => {
  // Simplified media session controls - no phone call handling here anymore
  useEffect(() => {
    if ('mediaSession' in navigator) {
      // Set metadata with uRadio branding
      if (tracks.length > 0 && currentIndex < tracks.length) {
        const currentTrack = tracks[currentIndex];
        
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack?.name || 'Unknown Station',
            artist: 'uRadio',
            album: 'Radio Stations',
            artwork: [
              { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '96x96', type: 'image/png' },
              { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '128x128', type: 'image/png' },
              { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '192x192', type: 'image/png' },
              { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '256x256', type: 'image/png' },
              { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '384x384', type: 'image/png' },
              { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '512x512', type: 'image/png' }
            ]
          });

          console.log("Updated media session metadata with uRadio branding:", {
            title: currentTrack?.name,
            artist: 'uRadio',
            stationUrl: currentTrack?.url,
            randomMode
          });
        } catch (error) {
          console.warn("Error setting media session metadata:", error);
        }
      }

      // Set playback state
      try {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (error) {
        console.warn("Error setting playback state:", error);
      }

      // Basic action handlers - interruption handling moved to useAudioInterruption
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          console.log("Media session play action triggered");
          setIsPlaying(true);
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          console.log("Media session pause action triggered");
          setIsPlaying(false);
        });
        
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          console.log("Media session previous track action triggered", { randomMode });
          onSkipPrevious();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          console.log("Media session next track action triggered", { randomMode });
          onSkipNext();
        });
        
        // Seek handling
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          console.log("Media session seek action triggered:", details);
          if (details.seekTime !== undefined && details.seekTime !== null) {
            onSeek(details.seekTime);
          }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          console.log("Media session stop action triggered");
          setIsPlaying(false);
        });

        // Additional seek actions
        try {
          navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            console.log("Media session seek backward:", details);
            const seekTime = (details.seekOffset || 10);
            const newTime = Math.max(0, trackPosition - seekTime);
            onSeek(newTime);
          });
          
          navigator.mediaSession.setActionHandler('seekforward', (details) => {
            console.log("Media session seek forward:", details);
            const seekTime = (details.seekOffset || 10);
            const newTime = Math.min(trackDuration || 0, trackPosition + seekTime);
            onSeek(newTime);
          });
        } catch (e) {
          console.log("Extended media session actions not supported");
        }

      } catch (error) {
        console.warn("Error setting media session action handlers:", error);
      }

      // Position state handling
      try {
        if (trackDuration && trackDuration !== Infinity && !isNaN(trackDuration)) {
          const currentTrack = tracks[currentIndex];
          const isHlsStream = currentTrack?.url?.includes('.m3u8');
          
          let playbackRate: number;
          if (isHlsStream) {
            playbackRate = isPlaying ? 1.0 : 0.001;
          } else {
            playbackRate = isPlaying ? 1.0 : 0.0001;
          }
          
          navigator.mediaSession.setPositionState({
            duration: trackDuration,
            position: Math.min(trackPosition || 0, trackDuration),
            playbackRate: playbackRate,
          });
          
          console.log("Set position state:", {
            duration: trackDuration,
            position: trackPosition,
            playbackRate,
            isHlsStream,
            streamUrl: currentTrack?.url
          });
        }
      } catch (error) {
        console.warn("Error setting position state:", error);
      }
    }
  }, [tracks, currentIndex, isPlaying, trackDuration, trackPosition, tracks[currentIndex]?.name, randomMode]);

  // Enhanced initialization with uRadio branding
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await androidAutoService.initialize();
        console.log("Android Auto service initialized");
      } catch (err) {
        console.warn('Error initializing Android Auto service:', err);
      }

      androidAutoService.registerCallbacks({
        onPlay: () => {
          console.log("Android Auto play callback triggered");
          setIsPlaying(true);
        },
        onPause: () => {
          console.log("Android Auto pause callback triggered");
          setIsPlaying(false);
        },
        onSkipNext: () => {
          console.log("Android Auto skip next callback triggered", { randomMode });
          onSkipNext();
        },
        onSkipPrevious: () => {
          console.log("Android Auto skip previous callback triggered", { randomMode });
          onSkipPrevious();
        },
        onSeek: (position) => {
          console.log("Android Auto seek callback triggered:", position);
          onSeek(position);
        },
      });
      
      try {
        await audioWakeLockService.requestWakeLock();
        console.log("Wake lock requested successfully");
      } catch (err) {
        console.warn('Error requesting wake lock:', err);
      }
    };

    initializeServices();
    
    return () => {
      androidAutoService.cleanup().catch(err => 
        console.warn('Error cleaning up Android Auto service:', err)
      );
      audioWakeLockService.releaseWakeLock();
    };
  }, []);

  useEffect(() => {
    if (tracks.length > 0 && currentIndex < tracks.length) {
      const currentTrack = tracks[currentIndex];
      
      if (currentTrack) {
        const trackInfo = {
          title: currentTrack.name || 'Unknown Station',
          artist: "uRadio",
          album: "Radio Stations",
          duration: trackDuration && trackDuration !== Infinity ? trackDuration : 0,
          position: trackPosition || 0,
          artworkUrl: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png',
        };
        
        console.log("Updating track info for notifications with uRadio branding:", trackInfo, { randomMode });
        
        androidAutoService.updateTrackInfo(trackInfo).catch(err => 
          console.warn('Error updating track info:', err)
        );
      }
    }
  }, [tracks, currentIndex, trackDuration, trackPosition, tracks[currentIndex]?.name, randomMode]);

  useEffect(() => {
    console.log("Updating Android Auto playback state:", isPlaying ? "playing" : "paused", { randomMode });
    androidAutoService.updatePlaybackState(isPlaying);
    
    if (isPlaying) {
      audioWakeLockService.requestWakeLock().catch(err => 
        console.warn('Error requesting wake lock on play:', err)
      );
    }
  }, [isPlaying, randomMode]);
};
