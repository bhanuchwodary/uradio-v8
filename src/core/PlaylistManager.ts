
import { Track } from './TrackManager';

export interface PlaylistTrack extends Track {
  addedToPlaylistAt: number;
}

class PlaylistManagerCore {
  private playlist: PlaylistTrack[] = [];
  private listeners: Array<(playlist: PlaylistTrack[]) => void> = [];
  private storageKey = 'uradio_playlist';

  constructor() {
    this.loadPlaylist();
  }

  private emit(): void {
    this.listeners.forEach(listener => listener([...this.playlist]));
  }

  private loadPlaylist(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.playlist = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load playlist:', error);
    }
  }

  private savePlaylist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.playlist));
    } catch (error) {
      console.warn('Failed to save playlist:', error);
    }
  }

  public subscribe(listener: (playlist: PlaylistTrack[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.playlist]); // Emit current state immediately
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getPlaylist(): PlaylistTrack[] {
    return [...this.playlist].sort((a, b) => {
      // Favorites first, then by added time
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.addedToPlaylistAt - b.addedToPlaylistAt;
    });
  }

  public addToPlaylist(track: Track): boolean {
    const exists = this.playlist.some(t => t.id === track.id);
    if (exists) return false;

    const playlistTrack: PlaylistTrack = {
      ...track,
      addedToPlaylistAt: Date.now(),
    };

    this.playlist.push(playlistTrack);
    this.savePlaylist();
    this.emit();
    return true;
  }

  public removeFromPlaylist(id: string): boolean {
    const initialLength = this.playlist.length;
    this.playlist = this.playlist.filter(track => track.id !== id);
    if (this.playlist.length < initialLength) {
      this.savePlaylist();
      this.emit();
      return true;
    }
    return false;
  }

  public clearPlaylist(): number {
    const count = this.playlist.length;
    this.playlist = [];
    this.savePlaylist();
    this.emit();
    return count;
  }

  public isInPlaylist(id: string): boolean {
    return this.playlist.some(track => track.id === id);
  }
}

export const PlaylistManager = new PlaylistManagerCore();
