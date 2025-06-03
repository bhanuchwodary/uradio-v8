
import { adminAuthService } from "./adminAuthService";
import { Track } from "@/types/track";

export interface AdminStationData {
  name: string;
  url: string;
  language: string;
}

class NewAdminStationsService {
  async getPrebuiltStations(): Promise<Track[]> {
    try {
      console.log("Admin: Fetching prebuilt stations...");
      
      const adminClient = adminAuthService.getAdminClient();
      
      const { data, error } = await adminClient
        .from('prebuilt_stations')
        .select('*')
        .eq('is_active', true)
        .order('language')
        .order('name');

      if (error) {
        console.error("Admin: Error fetching stations:", error);
        throw error;
      }

      console.log(`Admin: Loaded ${data?.length || 0} stations`);
      
      return (data || []).map(station => ({
        url: station.url,
        name: station.name,
        language: station.language,
        isFavorite: false,
        isPrebuilt: true,
        playTime: 0,
        supabaseId: station.id
      }));
    } catch (error) {
      console.error("Admin: Failed to fetch stations:", error);
      throw error;
    }
  }

  async bulkReplaceStations(stations: AdminStationData[]): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Admin: Bulk replacing ${stations.length} stations`);
      
      const adminClient = adminAuthService.getAdminClient();

      // First, deactivate all existing stations
      const { error: deactivateError } = await adminClient
        .from('prebuilt_stations')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        console.error("Admin: Error deactivating stations:", deactivateError);
        return { success: false, error: deactivateError.message };
      }

      // Then insert all new stations
      const stationsToInsert = stations.map(station => ({
        name: station.name,
        url: station.url,
        language: station.language || 'Unknown',
        is_active: true,
        created_by: null // Admin operations don't need user ID
      }));

      const { error: insertError } = await adminClient
        .from('prebuilt_stations')
        .insert(stationsToInsert);

      if (insertError) {
        console.error("Admin: Error inserting stations:", insertError);
        return { success: false, error: insertError.message };
      }

      console.log("Admin: Bulk replace completed successfully");
      return { success: true };
    } catch (error) {
      console.error("Admin: Failed to bulk replace stations:", error);
      return { success: false, error: 'Failed to bulk replace stations' };
    }
  }

  async addStation(station: AdminStationData): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Admin: Adding station: ${station.name}`);
      
      const adminClient = adminAuthService.getAdminClient();
      
      const { error } = await adminClient
        .from('prebuilt_stations')
        .insert({
          name: station.name,
          url: station.url,
          language: station.language || 'Unknown',
          is_active: true,
          created_by: null
        });

      if (error) {
        console.error("Admin: Error adding station:", error);
        return { success: false, error: error.message };
      }

      console.log("Admin: Station added successfully");
      return { success: true };
    } catch (error) {
      console.error("Admin: Failed to add station:", error);
      return { success: false, error: 'Failed to add station' };
    }
  }

  async updateStation(id: string, updates: Partial<AdminStationData>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Admin: Updating station ${id}`);
      
      const adminClient = adminAuthService.getAdminClient();
      
      const { error } = await adminClient
        .from('prebuilt_stations')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error("Admin: Error updating station:", error);
        return { success: false, error: error.message };
      }

      console.log("Admin: Station updated successfully");
      return { success: true };
    } catch (error) {
      console.error("Admin: Failed to update station:", error);
      return { success: false, error: 'Failed to update station' };
    }
  }

  async deleteStation(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Admin: Deleting station ${id}`);
      
      const adminClient = adminAuthService.getAdminClient();
      
      const { error } = await adminClient
        .from('prebuilt_stations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error("Admin: Error deleting station:", error);
        return { success: false, error: error.message };
      }

      console.log("Admin: Station deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("Admin: Failed to delete station:", error);
      return { success: false, error: 'Failed to delete station' };
    }
  }
}

export const newAdminStationsService = new NewAdminStationsService();
