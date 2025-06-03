
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPasswordDialog from "@/components/admin/AdminPasswordDialog";
import AdminStationsManager from "@/components/admin/AdminStationsManager";
import AdminDangerZone from "@/components/admin/AdminDangerZone";
import AdminAuthenticationCard from "@/components/admin/AdminAuthenticationCard";
import { savePrebuiltStations } from "@/utils/prebuiltStationsManager";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminPage = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Skip the authentication step if coming from StationListPage with successful auth
  useEffect(() => {
    const hasAuth = sessionStorage.getItem("admin_authenticated");
    if (hasAuth === "true") {
      console.log("Admin already authenticated, skipping password dialog");
      setIsAuthenticated(true);
      setIsPasswordDialogOpen(false);
    }
  }, []);

  const handlePasswordSuccess = () => {
    console.log("Authentication successful, showing admin interface");
    setIsPasswordDialogOpen(false);
    setIsAuthenticated(true);
    // Save authentication state to session storage
    sessionStorage.setItem("admin_authenticated", "true");
  };

  const handleSaveStations = (stations: any[]) => {
    // Validate stations before saving
    if (!Array.isArray(stations) || stations.length === 0) {
      toast({
        title: "Error",
        description: "Invalid stations data. Cannot save empty stations list.",
        variant: "destructive"
      });
      return;
    }
    
    if (savePrebuiltStations(stations, true)) {
      toast({
        title: "Changes saved",
        description: "Prebuilt stations have been updated successfully"
      });
      // savePrebuiltStations will handle the redirect
    } else {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    navigate("/station-list");
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl px-4 space-y-6 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Admin Controls
          </h1>
        </div>

        {isAuthenticated ? (
          <>
            <AdminStationsManager onSave={handleSaveStations} onCancel={handleCancel} />
            <AdminDangerZone isMobile={isMobile} />
          </>
        ) : (
          <AdminAuthenticationCard onAuthenticate={() => setIsPasswordDialogOpen(true)} />
        )}

        <AdminPasswordDialog 
          isOpen={isPasswordDialogOpen} 
          onClose={() => {
            setIsPasswordDialogOpen(false);
            if (!isAuthenticated) {
              navigate("/station-list");
            }
          }} 
          onSuccess={handlePasswordSuccess} 
        />
      </div>
    </AppLayout>
  );
};

export default AdminPage;
