
export interface Track {
  id?: string; // Add optional id for database records
  url: string;
  name: string;
  isFavorite: boolean;
  playTime: number;
  isPrebuilt?: boolean;
  language?: string; // New language attribute
}
