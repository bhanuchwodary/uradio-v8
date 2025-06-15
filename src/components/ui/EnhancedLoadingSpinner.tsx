
import React from "react";
import { Loader, Music, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedLoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  variant?: "default" | "music" | "radio";
  overlay?: boolean;
  className?: string;
}

export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({
  size = "md",
  text,
  variant = "default",
  overlay = false,
  className
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  const IconComponent = variant === "music" ? Music : variant === "radio" ? Radio : Loader;

  const spinner = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      overlay && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
      className
    )}>
      <div className="relative">
        <IconComponent 
          className={cn(
            sizeClasses[size],
            "animate-spin text-primary"
          )} 
        />
        {variant !== "default" && (
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
        )}
      </div>
      
      {text && (
        <p className={cn(
          textSizeClasses[size],
          "text-on-surface-variant font-medium animate-pulse"
        )}>
          {text}
        </p>
      )}
    </div>
  );

  return spinner;
};
