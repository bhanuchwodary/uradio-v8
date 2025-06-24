
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface VisualFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onDismiss?: () => void;
  className?: string;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorClasses = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

export const VisualFeedback: React.FC<VisualFeedbackProps> = ({
  type,
  message,
  duration = 3000,
  onDismiss,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ease-out',
        'animate-in slide-in-from-top-2 fade-in-0',
        colorClasses[type],
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// Progress indicator component
interface ProgressIndicatorProps {
  progress: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  showPercentage = false,
  size = 'md',
  variant = 'linear',
  className
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: variant === 'circular' ? 'h-8 w-8' : 'h-2',
    md: variant === 'circular' ? 'h-12 w-12' : 'h-3',
    lg: variant === 'circular' ? 'h-16 w-16' : 'h-4',
  };

  if (variant === 'circular') {
    const radius = size === 'sm' ? 14 : size === 'md' ? 20 : 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-muted-foreground/20"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{Math.round(clampedProgress)}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size], className)}>
      <div
        className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
        style={{ width: `${clampedProgress}%` }}
      />
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-primary-foreground">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};
