
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "minimal" | "card";
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
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      <div className={cn(
        "rounded-full p-4 transition-colors",
        variant === "minimal" 
          ? "bg-surface-container-high" 
          : "bg-gradient-to-br from-surface-container-high to-surface-container-highest"
      )}>
        <Icon className="h-12 w-12 text-on-surface-variant/60" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-on-surface">
          {title}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="mt-4 bg-primary hover:bg-primary/90 text-on-primary"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className={cn(
        "p-8 bg-gradient-to-br from-surface-container/50 to-surface-container-low/50",
        "border border-outline-variant/20 backdrop-blur-sm",
        className
      )}>
        {content}
      </Card>
    );
  }

  return (
    <div className={cn(
      "p-8",
      variant === "minimal" ? "py-12" : "py-16",
      className
    )}>
      {content}
    </div>
  );
};
