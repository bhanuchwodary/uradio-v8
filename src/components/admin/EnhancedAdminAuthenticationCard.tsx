
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

interface EnhancedAdminAuthenticationCardProps {
  onAuthenticate: () => void;
}

const EnhancedAdminAuthenticationCard: React.FC<EnhancedAdminAuthenticationCardProps> = ({ onAuthenticate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-br from-background/40 to-background/10 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader className="text-center">
          <motion.div 
            className="flex justify-center mb-4"
            animate={{ 
              rotateY: [0, 360],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              repeatDelay: 2
            }}
          >
            <div className="bg-primary/20 p-4 rounded-full">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </motion.div>
          <CardTitle className="text-center text-xl">Authentication Required</CardTitle>
          <CardDescription className="text-center">
            You need admin access to manage prebuilt stations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onAuthenticate} 
              className="flex items-center gap-2 px-6 material-shadow-1 hover:material-shadow-2 ink-ripple"
            >
              <Shield className="h-4 w-4" /> Authenticate
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedAdminAuthenticationCard;
