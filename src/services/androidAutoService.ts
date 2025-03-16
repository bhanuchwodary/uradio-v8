
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
  initialize() {
    if (this.isInitialized) return true;
    
    console.log("Android Auto service initialized");
    
    // In a real app, this would initialize the native media session
    // which would show controls in notifications, lock screen, etc.
    
    // Add event listeners for hardware media buttons
    this.setupMediaButtonEventListeners();
    
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
  }
  
  // Toggle play/pause based on current state
  private triggerPlayPause() {
    if (!this.callbacks) return;
    
    // This would check the actual playback state in a real implementation
    // For now we just toggle based on the isPlaying state that will be passed
    // from the music player component
    if (this._isPlaying) {
      this.callbacks.onPause();
    } else {
      this.callbacks.onPlay();
    }
  }
  
  // Track the current playing state internally
  private _isPlaying = false;

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
  updateTrackInfo(trackInfo: {
    title: string;
    artist: string;
    album?: string;
    duration: number;
    position: number;
    artworkUrl?: string;
    isLocalFile?: boolean;
  }) {
    if (!trackInfo) return;
    
    // Add information about whether this is a local file
    const sourceType = trackInfo.isLocalFile ? "Local File" : "Streaming";
    
    // In a real implementation, this would update the media session metadata
    // which would show in notifications, lock screen, and Android Auto
    console.log(`Updated media session metadata (${sourceType}):`, trackInfo);
  }

  // Update the current playback state
  updatePlaybackState(isPlaying: boolean) {
    this._isPlaying = isPlaying;
    
    // In a real implementation, this would update the media session playback state
    // which controls the play/pause button in notifications, etc.
    console.log("Updated Android Auto playback state:", isPlaying ? "playing" : "paused");
  }

  // Seek to a specific position
  seekTo(position: number) {
    if (this.callbacks?.onSeek) {
      this.callbacks.onSeek(position);
    }
  }

  // Clean up when the app is closed
  cleanup() {
    this.callbacks = null;
    this.isInitialized = false;
    console.log("Android Auto service cleaned up");
    
    // Remove any event listeners we've added
    // In a real implementation, this would also clean up the media session
  }
}

// Singleton instance
export default new AndroidAutoService();
