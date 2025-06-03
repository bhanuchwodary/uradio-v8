
import { adminAuthService } from "./adminAuthService";
import { adminStationsService } from "./adminStationsService";
import { Track } from "@/types/track";

export interface AdminStationData {
  name: string;
  url: string;
  language: string;
}

class NewAdminStationsService {
  async getPrebuiltStations(): Promise<Track[]> {
    if (!adminAuthService.isAdminAuthenticated()) {
      throw new Error("Admin authentication required");
    }
    
    return adminStationsService.getPrebuiltStations();
  }

  async bulkReplaceStations(stations: AdminStationData[]): Promise<{ success: boolean; error?: string }> {
    if (!adminAuthService.isAdminAuthenticated()) {
      throw new Error("Admin authentication required");
    }
    
    return adminStationsService.bulkReplaceStations(stations);
  }

  async addStation(station: AdminStationData): Promise<{ success: boolean; error?: string }> {
    if (!adminAuthService.isAdminAuthenticated()) {
      throw new Error("Admin authentication required");
    }
    
    return adminStationsService.addStation(station);
  }

  async updateStation(id: string, updates: Partial<AdminStationData>): Promise<{ success: boolean; error?: string }> {
    if (!adminAuthService.isAdminAuthenticated()) {
      throw new Error("Admin authentication required");
    }
    
    return adminStationsService.updateStation(id, updates);
  }

  async deleteStation(id: string): Promise<{ success: boolean; error?: string }> {
    if (!adminAuthService.isAdminAuthenticated()) {
      throw new Error("Admin authentication required");
    }
    
    return adminStationsService.deleteStation(id);
  }
}

export const newAdminStationsService = new NewAdminStationsService();
