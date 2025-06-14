
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export const RequestStationHeader: React.FC = () => {
  return (
    <CardHeader className="pb-3">
      <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
        <Mail className="h-6 w-6 text-primary" />
        Request Station
      </CardTitle>
      <p className="text-muted-foreground text-sm">
        Request to add a new station or modify an existing one
      </p>
    </CardHeader>
  );
};
