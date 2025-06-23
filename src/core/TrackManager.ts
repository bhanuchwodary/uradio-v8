
import { AudioTrack } from './AudioEngine';

export interface Track extends AudioTrack {
  isFeatured?: boolean;
  playTime?: number;
  addedAt?: number;
}

class TrackManagerCore {
  private tracks: Track[] = [];
  private listeners: Array<(tracks: Track[]) => void> = [];
  private storageKey = 'uradio_tracks';

  constructor() {
    this.loadTracks();
  }

  private emit(): void {
    this.listeners.forEach(listener => listener([...this.tracks]));
  }

  private loadTracks(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.tracks = JSON.parse(stored);
      } else {
        this.loadDefaultStations();
      }
    } catch (error) {
      console.warn('Failed to load tracks:', error);
      this.loadDefaultStations();
    }
  }

  private loadDefaultStations(): void {
    this.tracks = [
      {
        id: '1',
        name: 'BBC Radio 1',
        url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
        language: 'English',
        isFeatured: true,
        isFavorite: false,
        playTime: 0,
        addedAt: Date.now(),
      },
      {
        id: '2',
        name: 'NPR News',
        url: 'https://npr-ice.streamguys1.com/live.mp3',
        language: 'English',
        isFeatured: true,
        isFavorite: false,
        playTime: 0,
        addedAt: Date.now(),
      },
    ];
    this.saveTracks();
  }

  private saveTracks(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.tracks));
    } catch (error) {
      console.warn('Failed to save tracks:', error);
    }
  }

  public subscribe(listener: (tracks: Track[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.tracks]); // Emit current state immediately
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getTracks(): Track[] {
    return [...this.tracks];
  }

  public getFavorites(): Track[] {
    return this.tracks.filter(track => track.isFavorite);
  }

  public addTrack(track: Omit<Track, 'id' | 'addedAt'>): Track {
    const newTrack: Track = {
      ...track,
      id: Date.now().toString(),
      addedAt: Date.now(),
    };
    this.tracks.push(newTrack);
    this.saveTracks();
    this.emit();
    return newTrack;
  }

  public removeTrack(id: string): boolean {
    const initialLength = this.tracks.length;
    this.tracks = this.tracks.filter(track => track.id !== id);
    if (this.tracks.length < initialLength) {
      this.saveTracks();
      this.emit();
      return true;
    }
    return false;
  }

  public updateTrack(id: string, updates: Partial<Track>): boolean {
    const index = this.tracks.findIndex(track => track.id === id);
    if (index !== -1) {
      this.tracks[index] = { ...this.tracks[index], ...updates };
      this.saveTracks();
      this.emit();
      return true;
    }
    return false;
  }

  public toggleFavorite(id: string): boolean {
    const track = this.tracks.find(t => t.id === id);
    if (track) {
      track.isFavorite = !track.isFavorite;
      this.saveTracks();
      this.emit();
      return track.isFavorite;
    }
    return false;
  }

  public incrementPlayTime(id: string, seconds: number): void {
    const track = this.tracks.find(t => t.id === id);
    if (track) {
      track.playTime = (track.playTime || 0) + seconds;
      this.saveTracks();
      this.emit();
    }
  }
}

export const TrackManager = new TrackManagerCore();
