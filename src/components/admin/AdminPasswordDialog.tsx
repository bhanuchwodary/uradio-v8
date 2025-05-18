
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { verifyPassword } from "@/utils/adminAuth";
import { Shield } from "lucide-react";

interface AdminPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminPasswordDialog: React.FC<AdminPasswordDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Reset password field when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Immediate verification without delay
      const isValid = verifyPassword(password);
      
      if (isValid) {
        toast({
          title: "Access granted",
          description: "You now have admin access",
        });
        onSuccess();
      } else {
        toast({
          title: "Access denied",
          description: "Incorrect password",
          variant: "destructive",
        });
        setPassword("");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication error",
        description: "There was a problem verifying the password",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-md material-shadow-3">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center">Admin Authentication Required</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="bg-background/60"
              autoComplete="current-password"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !password.trim()}>
              {isSubmitting ? "Verifying..." : "Authenticate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPasswordDialog;
