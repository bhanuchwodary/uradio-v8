
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { resetPrebuiltStations } from "@/utils/prebuiltStationsManager";
import { useToast } from "@/hooks/use-toast";

interface AdminDangerZoneProps {
  isMobile: boolean;
}

const AdminDangerZone: React.FC<AdminDangerZoneProps> = ({ isMobile }) => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

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

  return (
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
          className={isMobile ? "w-full" : "w-auto"}
        >
          {isResetting ? "Resetting..." : "Reset to Default"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminDangerZone;
