
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
  // Set up media session controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      // Set metadata
      if (tracks.length > 0 && currentIndex < tracks.length) {
        const currentTrack = tracks[currentIndex];
        
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.name,
          artist: 'Streamify Jukebox',
          album: 'My Stations',
          artwork: [
            { src: '/og-image.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }

      // Set playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Set action handlers
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', onSkipPrevious);
      navigator.mediaSession.setActionHandler('nexttrack', onSkipNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) {
          onSeek(details.seekTime);
        }
      });

      // Update position state
      if (trackDuration) {
        navigator.mediaSession.setPositionState({
          duration: trackDuration,
          position: trackPosition,
          playbackRate: 1,
        });
      }
    }
  }, [tracks, currentIndex, isPlaying, trackDuration, trackPosition]);

  // Initialize Android Auto service
  useEffect(() => {
    androidAutoService.initialize().catch(err => 
      console.warn('Error initializing Android Auto service:', err)
    );

    // Register callbacks for Android Auto and media controls
    androidAutoService.registerCallbacks({
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
      onSkipNext,
      onSkipPrevious,
      onSeek,
    });
    
    // Request wake lock when music player initializes
    audioWakeLockService.requestWakeLock();
    
    return () => {
      androidAutoService.cleanup().catch(err => 
        console.warn('Error cleaning up Android Auto service:', err)
      );
      audioWakeLockService.releaseWakeLock();
    };
  }, []);

  // Update Android Auto with current track info
  useEffect(() => {
    if (tracks.length > 0 && currentIndex < tracks.length) {
      const currentTrack = tracks[currentIndex];
      
      androidAutoService.updateTrackInfo({
        title: currentTrack.name,
        artist: "Streamify Jukebox",
        album: "My Stations",
        duration: trackDuration || 0,
        position: trackPosition || 0,
        artworkUrl: 'https://example.com/artwork.jpg',
      }).catch(err => console.warn('Error updating track info:', err));
    }
  }, [tracks, currentIndex, trackDuration, trackPosition]);

  // Update Android Auto with playback state
  useEffect(() => {
    androidAutoService.updatePlaybackState(isPlaying);
    
    if (isPlaying) {
      audioWakeLockService.requestWakeLock();
    }
  }, [isPlaying]);
};

