
import { useEffect, useState } from 'react';

export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<Breakpoint>('md');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Determine breakpoint
      let currentBreakpoint: Breakpoint = 'xs';
      for (const [bp, minWidth] of Object.entries(BREAKPOINTS)) {
        if (width >= minWidth) {
          currentBreakpoint = bp as Breakpoint;
        }
      }
      setScreenSize(currentBreakpoint);

      // Determine orientation
      setOrientation(width > height ? 'landscape' : 'portrait');

      // Determine device type
      setIsMobile(width < BREAKPOINTS.md);
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
      setIsDesktop(width >= BREAKPOINTS.lg);
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  return {
    screenSize,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints: BREAKPOINTS
  };
};

export const getResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint,
  fallback: T
): T => {
  const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = orderedBreakpoints.indexOf(currentBreakpoint);
  
  // Look for the closest match, starting from current breakpoint and going down
  for (let i = currentIndex; i >= 0; i--) {
    const bp = orderedBreakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp]!;
    }
  }
  
  return fallback;
};

// Responsive grid utilities
export const getResponsiveColumns = (screenSize: Breakpoint): number => {
  const columnMap: Record<Breakpoint, number> = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6
  };
  return columnMap[screenSize] || 3;
};

export const getResponsiveSpacing = (screenSize: Breakpoint): string => {
  const spacingMap: Record<Breakpoint, string> = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-5',
    xl: 'gap-6',
    '2xl': 'gap-8'
  };
  return spacingMap[screenSize] || 'gap-4';
};

export const getResponsivePadding = (screenSize: Breakpoint): string => {
  const paddingMap: Record<Breakpoint, string> = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-10'
  };
  return paddingMap[screenSize] || 'p-4';
};
