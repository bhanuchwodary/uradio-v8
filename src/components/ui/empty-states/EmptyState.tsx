
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "minimal" | "illustrated";
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center space-y-4 p-6">
      {/* Icon with animated background */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center animate-pulse">
          <Icon className="w-10 h-10 text-primary/60" />
        </div>
        {variant === "illustrated" && (
          <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-primary/10 to-transparent animate-ping" />
        )}
      </div>
      
      {/* Text Content */}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      
      {/* Action Button */}
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (variant === "minimal") {
    return (
      <div className={cn("py-12", className)}>
        {content}
      </div>
    );
  }

  return (
    <Card className={cn(
      "border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-background/50 to-muted/10",
      "hover:border-primary/30 transition-colors duration-200",
      className
    )}>
      {content}
    </Card>
  );
};
