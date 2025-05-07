
export interface Track {
  url: string;
  name: string;
  isFavorite: boolean;
  playTime: number;
  isPrebuilt?: boolean;
  language?: string; // New language attribute
}
