
export interface Track {
  url: string;
  name: string;
  isFavorite: boolean;
  playTime: number;
  isPrebuilt?: boolean;
  language?: string;
  supabaseId?: string; // Reference to Supabase station ID for analytics
}
