
import { Media } from '@capacitor-community/media';
import { Capacitor } from '@capacitor/core';

// This service provides integration with Android Auto and handles media controls
// for notifications, lock screen, and background playback

class AndroidAutoService {
  private callbacks: {
    onPlay: () => void;
    onPause: () => void;
    onSkipNext: () => void;
    onSkipPrevious: () => void;
    onSeek?: (position: number) => void;
  } | null = null;

  private isInitialized = false;
  
  // Initialize the service and media session
  async initialize() {
    if (this.isInitialized) return true;
    
    console.log("Android Auto service initializing");
    
    // Initialize the native media session only on Android
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Use the Media plugin to create session
        await (Media as any).createMediaSession();
        
        // Set up event listeners for media controls - use any to bypass TypeScript errors
        (Media as any).addListener('mediaButtonsNotificationAction', (action: any) => {
          if (!this.callbacks) return;
          
          switch (action.action) {
            case 'play':
              this.callbacks.onPlay();
              break;
            case 'pause':
              this.callbacks.onPause();
              break;
            case 'stop':
              this.callbacks.onPause();
              break;
            case 'next':
              this.callbacks.onSkipNext();
              break;
            case 'previous':
              this.callbacks.onSkipPrevious();
              break;
            case 'seekTo':
              if (this.callbacks.onSeek && action.position !== undefined) {
                this.callbacks.onSeek(action.position / 1000); // Convert from ms to seconds
              }
              break;
          }
        });
        
        console.log("Android Auto service initialized with native capabilities");
      } catch (error) {
        console.error("Failed to initialize media session:", error);
        // Fall back to web implementation
        this.setupMediaButtonEventListeners();
      }
    } else {
      // For non-Android platforms, use web implementation
      this.setupMediaButtonEventListeners();
      console.log("Android Auto service initialized with web fallback");
    }
    
    this.isInitialized = true;
    return true;
  }

  // Set up event listeners for media buttons
  private setupMediaButtonEventListeners() {
    // In a real implementation, this would listen for native media button events
    // For now, we'll simulate with keyboard events for testing
    document.addEventListener('keydown', (event) => {
      if (!this.callbacks) return;
      
      // Space = play/pause
      if (event.code === 'Space' && (event.target as HTMLElement).tagName !== 'INPUT') {
        event.preventDefault();
        this.triggerPlayPause();
      }
      
      // Media keys if available
      if (event.code === 'MediaPlayPause') {
        event.preventDefault();
        this.triggerPlayPause();
      } else if (event.code === 'MediaTrackNext') {
        event.preventDefault();
        this.callbacks.onSkipNext();
      } else if (event.code === 'MediaTrackPrevious') {
        event.preventDefault();
        this.callbacks.onSkipPrevious();
      }
    });

    // Add seek event listener for Android Auto
    document.addEventListener('keydown', (event) => {
      if (!this.callbacks?.onSeek) return;
      
      // Simulate seeking with left/right arrow keys (for testing)
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        // Seek back 10 seconds
        this.callbacks.onSeek(Math.max(0, this._currentPosition - 10));
      } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        // Seek forward 10 seconds
        if (this._duration > 0) {
          this.callbacks.onSeek(Math.min(this._duration, this._currentPosition + 10));
        }
      }
    });
  }

  // Toggle play/pause based on current state
  private triggerPlayPause() {
    if (!this.callbacks) return;
    
    if (this._isPlaying) {
      this.callbacks.onPause();
    } else {
      this.callbacks.onPlay();
    }
  }
  
  // Track the current playing state internally
  private _isPlaying = false;
  private _currentPosition = 0;
  private _duration = 0;

  // Register callbacks for media controls
  registerCallbacks(callbacks: {
    onPlay: () => void;
    onPause: () => void;
    onSkipNext: () => void;
    onSkipPrevious: () => void;
    onSeek?: (position: number) => void;
  }) {
    this.callbacks = callbacks;
    console.log("Android Auto callbacks registered");
  }

  // Update the currently playing track information
  async updateTrackInfo(trackInfo: {
    title: string;
    artist: string;
    album?: string;
    duration: number;
    position: number;
    artworkUrl?: string;
  }) {
    if (!trackInfo) return;
    
    this._currentPosition = trackInfo.position;
    this._duration = trackInfo.duration;
    
    // Update media session metadata which shows in notifications, 
    // lock screen, and Android Auto
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Use the correct method for setting media info with any type
        await (Media as any).setMediaInfo({
          title: trackInfo.title,
          artist: trackInfo.artist,
          album: trackInfo.album || '',
          duration: Math.round(trackInfo.duration * 1000), // Convert to milliseconds
          artwork: trackInfo.artworkUrl || '',
          playbackPosition: Math.round(trackInfo.position * 1000) // Convert to milliseconds
        });
        console.log("Updated native media session metadata:", trackInfo);
      } catch (error) {
        console.error("Error updating media metadata:", error);
      }
    }
    
    console.log("Updated media session metadata:", trackInfo);
  }

  // Update the current playback state
  async updatePlaybackState(isPlaying: boolean) {
    this._isPlaying = isPlaying;
    
    // Update native media session state on Android
    if (Capacitor.getPlatform() === 'android') {
      try {
        if (isPlaying) {
          // Set playback state to playing
          await (Media as any).setPlaybackState({ 
            playbackState: 'playing',
            position: Math.round(this._currentPosition * 1000) // Convert to milliseconds
          });
        } else {
          // Set playback state to paused
          await (Media as any).setPlaybackState({ 
            playbackState: 'paused',
            position: Math.round(this._currentPosition * 1000) // Convert to milliseconds
          });
        }
      } catch (error) {
        console.error("Error updating playback state:", error);
      }
    }
    
    console.log("Updated Android Auto playback state:", isPlaying ? "playing" : "paused");
  }

  // Seek to a specific position
  async seekTo(position: number) {
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Use correct method for setting playback position
        await (Media as any).setPlaybackState({
          playbackState: this._isPlaying ? 'playing' : 'paused',
          position: Math.round(position * 1000) // Convert to milliseconds
        });
      } catch (error) {
        console.error("Error seeking:", error);
      }
    }
    
    if (this.callbacks?.onSeek) {
      this.callbacks.onSeek(position);
    }
  }

  // Clean up when the app is closed
  async cleanup() {
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Remove the media session entirely
        await (Media as any).destroyMediaSession();
        // Remove event listeners
        await (Media as any).removeAllListeners();
      } catch (error) {
        console.error("Error cleaning up media session:", error);
      }
    }
    
    this.callbacks = null;
    this.isInitialized = false;
    console.log("Android Auto service cleaned up");
  }
}

// Singleton instance
export default new AndroidAutoService();
