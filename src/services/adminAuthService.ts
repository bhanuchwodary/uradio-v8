
import { supabase } from "@/integrations/supabase/client";

class AdminAuthService {
  private isAuthenticated = false;
  private readonly ADMIN_PASSWORD = "admin123";

  authenticate(password: string): boolean {
    this.isAuthenticated = password === this.ADMIN_PASSWORD;
    if (this.isAuthenticated) {
      sessionStorage.setItem("admin_authenticated", "true");
    }
    return this.isAuthenticated;
  }

  isAdminAuthenticated(): boolean {
    return this.isAuthenticated || sessionStorage.getItem("admin_authenticated") === "true";
  }

  logout(): void {
    this.isAuthenticated = false;
    sessionStorage.removeItem("admin_authenticated");
  }

  getAdminClient() {
    if (!this.isAdminAuthenticated()) {
      throw new Error("Admin authentication required");
    }
    // Use the regular supabase client - admin operations will be handled differently
    return supabase;
  }
}

export const adminAuthService = new AdminAuthService();
