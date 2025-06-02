
import { supabase } from "@/integrations/supabase/client";
import { Track } from "@/types/track";

export interface PrebuiltStation {
  id: string;
  name: string;
  url: string;
  language: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface StationAnalytics {
  id: string;
  station_id: string;
  user_session_id: string | null;
  play_count: number;
  total_play_time: number;
  last_played_at: string;
  created_at: string;
}

class SupabaseStationsService {
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID for analytics
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('streamify_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('streamify_session_id', sessionId);
    }
    return sessionId;
  }

  async getPrebuiltStations(): Promise<Track[]> {
    try {
      console.log("Fetching prebuilt stations from Supabase...");
      
      const { data, error } = await supabase
        .from('prebuilt_stations')
        .select('*')
        .eq('is_active', true)
        .order('language')
        .order('name');

      if (error) {
        console.error("Error fetching prebuilt stations:", error);
        throw error;
      }

      console.log(`Loaded ${data?.length || 0} prebuilt stations from Supabase`);
      
      // Convert to Track format
      const tracks: Track[] = (data || []).map(station => ({
        url: station.url,
        name: station.name,
        language: station.language,
        isFavorite: false,
        isPrebuilt: true,
        playTime: 0,
        supabaseId: station.id // Add reference to Supabase ID
      }));

      return tracks;
    } catch (error) {
      console.error("Failed to fetch prebuilt stations:", error);
      return [];
    }
  }

  async trackStationPlay(stationUrl: string, playTime: number = 0): Promise<void> {
    try {
      // Find station by URL to get its ID
      const { data: station } = await supabase
        .from('prebuilt_stations')
        .select('id')
        .eq('url', stationUrl)
        .eq('is_active', true)
        .single();

      if (!station) {
        console.log("Station not found in database, skipping analytics");
        return;
      }

      console.log(`Tracking play for station ${station.id}, playtime: ${playTime}s`);

      // Call analytics edge function
      const { error } = await supabase.functions.invoke('analytics', {
        body: {
          station_id: station.id,
          user_session_id: this.sessionId,
          play_time: playTime
        }
      });

      if (error) {
        console.error("Error tracking station play:", error);
      } else {
        console.log("Station play tracked successfully");
      }
    } catch (error) {
      console.error("Failed to track station play:", error);
    }
  }

  async addStation(name: string, url: string, language: string = 'Unknown'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Adding station: ${name} - ${url}`);
      
      const { data, error } = await supabase
        .from('prebuilt_stations')
        .insert({
          name,
          url,
          language
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding station:", error);
        return { success: false, error: error.message };
      }

      console.log("Station added successfully:", data);
      return { success: true };
    } catch (error) {
      console.error("Failed to add station:", error);
      return { success: false, error: 'Failed to add station' };
    }
  }

  async updateStation(id: string, updates: Partial<{ name: string; url: string; language: string }>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Updating station ${id}:`, updates);
      
      const { error } = await supabase
        .from('prebuilt_stations')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error("Error updating station:", error);
        return { success: false, error: error.message };
      }

      console.log("Station updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Failed to update station:", error);
      return { success: false, error: 'Failed to update station' };
    }
  }

  async deleteStation(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Soft deleting station ${id}`);
      
      const { error } = await supabase
        .from('prebuilt_stations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error("Error deleting station:", error);
        return { success: false, error: error.message };
      }

      console.log("Station deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("Failed to delete station:", error);
      return { success: false, error: 'Failed to delete station' };
    }
  }

  async getAnalytics(): Promise<StationAnalytics[]> {
    try {
      const { data, error } = await supabase.functions.invoke('analytics');

      if (error) {
        console.error("Error fetching analytics:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      return [];
    }
  }
}

export const supabaseStationsService = new SupabaseStationsService();
