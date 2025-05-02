
interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  duration: number;
  position: number;
  artworkUrl: string;
}

interface AndroidAutoCallbacks {
  onPlay: () => void;
  onPause: () => void;
  onSkipNext: () => void;
  onSkipPrevious: () => void;
  onSeek: (position: number) => void;
}

// Define an interface for the Media plugin
interface MediaPlugin {
  updateMediaNotification(options: {
    title: string;
    artist: string;
    album: string;
    artwork: string;
    duration: number;
    position: number;
  }): Promise<void>;
  updatePlaybackState(options: { isPlaying: boolean }): Promise<void>;
}

class AndroidAutoService {
  private initialized = false;
  private callbacks: AndroidAutoCallbacks | null = null;
  private currentTrackInfo: TrackInfo | null = null;

  async initialize() {
    try {
      // Check if we're in a Capacitor environment with the Media plugin
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isPluginAvailable('Media')) {
        // This would be the actual implementation if the Media plugin is available
        console.log("Android Auto service initializing with Capacitor Media plugin");
        // Media plugin initialization would go here
        this.initialized = true;
        return;
      }
    } catch (err) {
      // If import fails or plugin isn't available, fall back to web implementation
    }
    
    // Web fallback implementation (no-op for most functions)
    console.log("Android Auto service initialized with web fallback");
    this.initialized = true;
  }

  registerCallbacks(callbacks: AndroidAutoCallbacks) {
    this.callbacks = callbacks;
    console.log("Android Auto callbacks registered");
    return true;
  }

  async updateTrackInfo(trackInfo: TrackInfo) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Store the current track info for notification updates
    this.currentTrackInfo = trackInfo;
    
    // Log for debugging
    console.log("Updated media session metadata for notifications:", trackInfo);
    
    // Try to update the Android notification via Capacitor plugin if available
    try {
      const { Capacitor, registerPlugin } = await import('@capacitor/core');
      
      if (Capacitor.isPluginAvailable('Media')) {
        try {
          const MediaPlugin = registerPlugin<MediaPlugin>('Media');
          if (MediaPlugin) {
            await MediaPlugin.updateMediaNotification({
              title: trackInfo.title,
              artist: trackInfo.artist,
              album: trackInfo.album,
              artwork: trackInfo.artworkUrl,
              duration: trackInfo.duration,
              position: trackInfo.position
            });
            console.log("Updated native media notification with track info");
          }
        } catch (pluginErr) {
          console.warn("Error updating media notification:", pluginErr);
        }
      }
    } catch (err) {
      // Silently fail on web platforms
    }
    
    return true;
  }

  async updatePlaybackState(isPlaying: boolean) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Log the state change
    console.log("Updated Android Auto playback state:", isPlaying ? "playing" : "paused");
    
    // If we have current track info, make sure the notification shows the correct info
    if (isPlaying && this.currentTrackInfo) {
      // If starting playback, make sure notification has updated info
      this.updateTrackInfo(this.currentTrackInfo);
    }
    
    // Try to update the Android notification state via Capacitor plugin if available
    try {
      const { Capacitor, registerPlugin } = await import('@capacitor/core');
      
      if (Capacitor.isPluginAvailable('Media')) {
        try {
          const MediaPlugin = registerPlugin<MediaPlugin>('Media');
          if (MediaPlugin) {
            await MediaPlugin.updatePlaybackState({
              isPlaying: isPlaying
            });
            console.log("Updated native media notification playback state");
          }
        } catch (pluginErr) {
          console.warn("Error updating playback state:", pluginErr);
        }
      }
    } catch (err) {
      // Silently fail on web platforms
    }
    
    return true;
  }

  async cleanup() {
    this.callbacks = null;
    this.currentTrackInfo = null;
    console.log("Android Auto service cleaned up");
    return true;
  }
}

export default new AndroidAutoService();
