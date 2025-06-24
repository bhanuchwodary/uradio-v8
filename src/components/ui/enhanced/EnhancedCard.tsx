
import React, { forwardRef, useState } from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/utils/responsive';

interface EnhancedCardProps extends CardProps {
  interactive?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none';
  loading?: boolean;
  selected?: boolean;
}

const elevationClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

const hoverEffectClasses = {
  lift: 'hover:-translate-y-1 hover:shadow-xl',
  glow: 'hover:shadow-2xl hover:shadow-primary/20',
  scale: 'hover:scale-105',
  none: ''
};

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(({
  children,
  className,
  interactive = false,
  elevation = 'sm',
  hoverEffect = 'lift',
  loading = false,
  selected = false,
  onClick,
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isMobile } = useResponsive();

  return (
    <Card
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-out',
        elevationClasses[elevation],
        interactive && [
          'cursor-pointer',
          !isMobile && hoverEffectClasses[hoverEffect],
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        ],
        selected && 'ring-2 ring-primary bg-primary/5',
        loading && 'animate-pulse',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      {...props}
    >
      {loading ? (
        <div className="animate-pulse space-y-3 p-6">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      ) : (
        children
      )}
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 h-3 w-3 bg-primary rounded-full ring-2 ring-background" />
      )}
      
      {/* Hover overlay for interactive cards */}
      {interactive && isHovered && !isMobile && (
        <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none transition-opacity duration-200" />
      )}
    </Card>
  );
});

EnhancedCard.displayName = 'EnhancedCard';
