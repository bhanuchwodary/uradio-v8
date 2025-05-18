
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminPasswordDialog from "@/components/admin/AdminPasswordDialog";
import AdminStationsManager from "@/components/admin/AdminStationsManager";
import { savePrebuiltStations, resetPrebuiltStations, getPrebuiltStations } from "@/utils/prebuiltStationsManager";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  const handleResetToDefault = () => {
    setIsResetting(true);
    setTimeout(() => {
      if (resetPrebuiltStations(true)) {
        toast({
          title: "Reset complete",
          description: "Prebuilt stations have been reset to default values"
        });
        // resetPrebuiltStations will handle the redirect
      } else {
        toast({
          title: "Error",
          description: "Failed to reset stations",
          variant: "destructive"
        });
        setIsResetting(false);
      }
    }, 500);
  };

  const handleCancel = () => {
    navigate("/station-list");
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-5xl space-y-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Admin Controls
          </h1>
        </div>

        {isAuthenticated ? (
          <>
            <AdminStationsManager onSave={handleSaveStations} onCancel={handleCancel} />
            
            <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Reset prebuilt stations to their default values</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleResetToDefault}
                  disabled={isResetting}
                >
                  {isResetting ? "Resetting..." : "Reset to Default"}
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-background/30 backdrop-blur-md border-none shadow-lg material-shadow-2">
            <CardHeader>
              <CardTitle className="text-center">Authentication Required</CardTitle>
              <CardDescription className="text-center">
                You need admin access to manage prebuilt stations
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => setIsPasswordDialogOpen(true)} className="flex items-center gap-1">
                <Shield className="h-4 w-4" /> Authenticate
              </Button>
            </CardContent>
          </Card>
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
