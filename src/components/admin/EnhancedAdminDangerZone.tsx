
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { resetPrebuiltStations } from "@/utils/prebuiltStationsManager";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface EnhancedAdminDangerZoneProps {
  isMobile: boolean;
}

const EnhancedAdminDangerZone: React.FC<EnhancedAdminDangerZoneProps> = ({ isMobile }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-background/40 to-destructive/5 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription>Reset prebuilt stations to their default values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action will reset all prebuilt stations to their original state. Any custom modifications will be lost.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="destructive" 
                onClick={handleResetToDefault}
                disabled={isResetting}
                className={`${isMobile ? "w-full" : "w-auto"} material-shadow-1 hover:material-shadow-2 ink-ripple`}
              >
                {isResetting ? (
                  <>
                    <span className="animate-pulse">Resetting...</span>
                  </>
                ) : (
                  <>Reset to Default</>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedAdminDangerZone;
