
import Hls from "hls.js";

export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  language?: string;
  isFavorite?: boolean;
  artwork?: string;
}

export interface AudioState {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  loading: boolean;
  error: string | null;
}

class AudioEngineCore {
  private audio: HTMLAudioElement;
  private hls: Hls | null = null;
  private state: AudioState;
  private listeners: Array<(state: AudioState) => void> = [];
  private interruptionState = {
    wasPlayingBeforeInterruption: false,
    interruptionActive: false,
  };

  constructor() {
    this.audio = new Audio();
    this.audio.preload = "none";
    this.audio.crossOrigin = "anonymous";
    this.audio.playsInline = true;
    
    this.state = {
      currentTrack: null,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      volume: this.getStoredVolume(),
      loading: false,
      error: null,
    };

    this.setupAudioEvents();
    this.setupInterruptionHandling();
    this.setupMediaSession();
    this.audio.volume = this.state.volume;
  }

  private getStoredVolume(): number {
    try {
      const stored = localStorage.getItem('uradio_volume');
      return stored ? parseFloat(stored) : 0.7;
    } catch {
      return 0.7;
    }
  }

  private saveVolume(volume: number): void {
    try {
      localStorage.setItem('uradio_volume', volume.toString());
    } catch (error) {
      console.warn('Failed to save volume:', error);
    }
  }

  private emit(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  private setupAudioEvents(): void {
    this.audio.addEventListener('loadstart', () => {
      this.updateState({ loading: true, error: null });
    });

    this.audio.addEventListener('canplay', () => {
      this.updateState({ loading: false });
    });

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, isPaused: false });
      this.requestWakeLock();
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false, isPaused: true });
    });

    this.audio.addEventListener('timeupdate', () => {
      this.updateState({ 
        currentTime: this.audio.currentTime,
        duration: this.audio.duration || 0 
      });
    });

    this.audio.addEventListener('durationchange', () => {
      this.updateState({ duration: this.audio.duration || 0 });
    });

    this.audio.addEventListener('error', () => {
      this.updateState({ 
        loading: false, 
        isPlaying: false,
        error: 'Failed to load audio stream' 
      });
    });

    this.audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false, isPaused: false });
    });
  }

  private setupInterruptionHandling(): void {
    // Page Visibility API - most reliable for phone calls
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.isPlaying) {
        this.interruptionState.wasPlayingBeforeInterruption = true;
        this.interruptionState.interruptionActive = true;
        this.audio.pause();
      } else if (!document.hidden && this.interruptionState.wasPlayingBeforeInterruption) {
        setTimeout(() => {
          if (this.interruptionState.wasPlayingBeforeInterruption) {
            this.play().catch(console.warn);
            this.interruptionState.wasPlayingBeforeInterruption = false;
            this.interruptionState.interruptionActive = false;
          }
        }, 1000);
      }
    });

    // Audio Context interruption detection
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.addEventListener('statechange', () => {
        if (audioContext.state === 'suspended' && this.state.isPlaying) {
          this.interruptionState.wasPlayingBeforeInterruption = true;
          this.interruptionState.interruptionActive = true;
        } else if (audioContext.state === 'running' && this.interruptionState.wasPlayingBeforeInterruption) {
          setTimeout(() => {
            if (this.interruptionState.wasPlayingBeforeInterruption) {
              this.play().catch(console.warn);
              this.interruptionState.wasPlayingBeforeInterruption = false;
              this.interruptionState.interruptionActive = false;
            }
          }, 1500);
        }
      });
    } catch (error) {
      console.warn('AudioContext not available:', error);
    }
  }

  private setupMediaSession(): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('stop', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    }
  }

  private updateMediaSession(): void {
    if ('mediaSession' in navigator && this.state.currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.state.currentTrack.name,
        artist: 'uRadio',
        album: 'Radio Stations',
        artwork: this.state.currentTrack.artwork ? [
          { src: this.state.currentTrack.artwork, sizes: '512x512', type: 'image/png' }
        ] : [
          { src: '/lovable-uploads/f6bddacc-e4ab-42a4-bdd9-3ea0d18320c0.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.playbackState = this.state.isPlaying ? 'playing' : 'paused';

      if (this.state.duration && this.state.duration !== Infinity) {
        navigator.mediaSession.setPositionState({
          duration: this.state.duration,
          position: this.state.currentTime,
          playbackRate: this.state.isPlaying ? 1.0 : 0.0,
        });
      }
    }
  }

  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        await (navigator as any).wakeLock.request('screen');
      }
    } catch (error) {
      console.warn('Wake lock failed:', error);
    }
  }

  private updateState(updates: Partial<AudioState>): void {
    this.state = { ...this.state, ...updates };
    this.emit();
    this.updateMediaSession();
  }

  public subscribe(listener: (state: AudioState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState(): AudioState {
    return { ...this.state };
  }

  public async loadTrack(track: AudioTrack): Promise<void> {
    this.updateState({ currentTrack: track, loading: true, error: null });

    // Clean up previous HLS instance
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    try {
      if (track.url.includes('.m3u8') && Hls.isSupported()) {
        // HLS stream
        this.hls = new Hls({
          enableWorker: false,
          maxBufferLength: 15,
          maxMaxBufferLength: 30,
          autoStartLoad: true,
          startLevel: -1,
        });

        this.hls.attachMedia(this.audio);
        this.hls.loadSource(track.url);

        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.updateState({ loading: false });
        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            this.updateState({ 
              loading: false, 
              error: 'HLS stream error',
              isPlaying: false 
            });
          }
        });
      } else {
        // Direct stream
        this.audio.src = track.url;
        this.audio.load();
      }
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: 'Failed to load track',
        isPlaying: false 
      });
    }
  }

  public async play(): Promise<void> {
    try {
      await this.audio.play();
      this.interruptionState.wasPlayingBeforeInterruption = false;
      this.interruptionState.interruptionActive = false;
    } catch (error) {
      this.updateState({ 
        isPlaying: false, 
        error: 'Playback failed - user interaction required' 
      });
      throw error;
    }
  }

  public pause(): void {
    this.audio.pause();
    this.interruptionState.wasPlayingBeforeInterruption = false;
    this.interruptionState.interruptionActive = false;
  }

  public seek(time: number): void {
    this.audio.currentTime = time;
  }

  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audio.volume = clampedVolume;
    this.updateState({ volume: clampedVolume });
    this.saveVolume(clampedVolume);
  }

  public destroy(): void {
    this.audio.pause();
    this.audio.src = '';
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    this.listeners = [];
  }
}

export const AudioEngine = new AudioEngineCore();
