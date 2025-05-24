
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
}: UseMediaSessionProps) => {
  // Enhanced media session controls for iOS
  useEffect(() => {
    if ('mediaSession' in navigator) {
      // Set metadata with enhanced iOS compatibility
      if (tracks.length > 0 && currentIndex < tracks.length) {
        const currentTrack = tracks[currentIndex];
        
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack?.name || 'Unknown Station',
            artist: 'Streamify Jukebox',
            album: 'Radio Stations',
            artwork: [
              { src: '/og-image.png', sizes: '96x96', type: 'image/png' },
              { src: '/og-image.png', sizes: '128x128', type: 'image/png' },
              { src: '/og-image.png', sizes: '192x192', type: 'image/png' },
              { src: '/og-image.png', sizes: '256x256', type: 'image/png' },
              { src: '/og-image.png', sizes: '384x384', type: 'image/png' },
              { src: '/og-image.png', sizes: '512x512', type: 'image/png' }
            ]
          });

          console.log("Updated media session metadata:", {
            title: currentTrack?.name,
            stationUrl: currentTrack?.url
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

      // Enhanced action handlers with better iOS support
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
          console.log("Media session previous track action triggered");
          onSkipPrevious();
        });
        
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          console.log("Media session next track action triggered");
          onSkipNext();
        });
        
        // Enhanced seek handling for iOS
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          console.log("Media session seek action triggered:", details);
          if (details.seekTime !== undefined && details.seekTime !== null) {
            onSeek(details.seekTime);
          }
        });

        // Additional iOS-specific handlers
        navigator.mediaSession.setActionHandler('stop', () => {
          console.log("Media session stop action triggered");
          setIsPlaying(false);
        });

      } catch (error) {
        console.warn("Error setting media session action handlers:", error);
      }

      // Enhanced position state for iOS
      try {
        if (trackDuration && trackDuration !== Infinity && !isNaN(trackDuration)) {
          navigator.mediaSession.setPositionState({
            duration: trackDuration,
            position: Math.min(trackPosition || 0, trackDuration),
            playbackRate: isPlaying ? 1.0 : 0,
          });
        }
      } catch (error) {
        console.warn("Error setting position state:", error);
      }
    }
  }, [tracks, currentIndex, isPlaying, trackDuration, trackPosition, tracks[currentIndex]?.name]);

  // Enhanced initialization with iOS focus
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await androidAutoService.initialize();
        console.log("Android Auto service initialized");
      } catch (err) {
        console.warn('Error initializing Android Auto service:', err);
      }

      // Enhanced callbacks for iOS compatibility
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
          console.log("Android Auto skip next callback triggered");
          onSkipNext();
        },
        onSkipPrevious: () => {
          console.log("Android Auto skip previous callback triggered");
          onSkipPrevious();
        },
        onSeek: (position) => {
          console.log("Android Auto seek callback triggered:", position);
          onSeek(position);
        },
      });
      
      // Enhanced wake lock for iOS
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

  // Enhanced track info updates for iOS
  useEffect(() => {
    if (tracks.length > 0 && currentIndex < tracks.length) {
      const currentTrack = tracks[currentIndex];
      
      if (currentTrack) {
        const trackInfo = {
          title: currentTrack.name || 'Unknown Station',
          artist: "Streamify Jukebox",
          album: "Radio Stations",
          duration: trackDuration && trackDuration !== Infinity ? trackDuration : 0,
          position: trackPosition || 0,
          artworkUrl: '/og-image.png',
        };
        
        console.log("Updating track info for notifications:", trackInfo);
        
        androidAutoService.updateTrackInfo(trackInfo).catch(err => 
          console.warn('Error updating track info:', err)
        );
      }
    }
  }, [tracks, currentIndex, trackDuration, trackPosition, tracks[currentIndex]?.name]);

  // Enhanced playback state updates for iOS
  useEffect(() => {
    console.log("Updating Android Auto playback state:", isPlaying ? "playing" : "paused");
    androidAutoService.updatePlaybackState(isPlaying);
    
    if (isPlaying) {
      audioWakeLockService.requestWakeLock().catch(err => 
        console.warn('Error requesting wake lock on play:', err)
      );
    }
  }, [isPlaying]);
};
