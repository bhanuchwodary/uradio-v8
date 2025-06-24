
import React, { forwardRef, useRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEnhancedInteractions } from '@/hooks/useEnhancedInteractions';
import { useAccessibility } from '@/hooks/useAccessibility';
import { Loader } from 'lucide-react';

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  ripple?: boolean;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
  ariaLabel?: string;
  keyboardShortcut?: string[];
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(({
  children,
  className,
  loading = false,
  ripple = true,
  hapticFeedback = true,
  soundFeedback = false,
  ariaLabel,
  keyboardShortcut,
  onClick,
  disabled,
  ...props
}, ref) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { handleInteraction } = useEnhancedInteractions({
    enableRipple: ripple,
    enableHaptic: hapticFeedback,
    enableSoundFeedback: soundFeedback
  });
  const { isKeyboardUser } = useAccessibility();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    handleInteraction(e, {
      hapticIntensity: 'light',
      playSound: soundFeedback
    });

    onClick?.(e);
  };

  return (
    <Button
      ref={ref || buttonRef}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-md',
        loading && 'pointer-events-none',
        isKeyboardUser && 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={keyboardShortcut ? `${ariaLabel || 'Button'} (${keyboardShortcut.join(' + ')})` : ariaLabel}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader className="h-4 w-4 animate-spin" />
        </div>
      )}
      <span className={cn('flex items-center gap-2', loading && 'opacity-0')}>
        {children}
      </span>
    </Button>
  );
});

EnhancedButton.displayName = 'EnhancedButton';
