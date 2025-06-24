
import { useEffect, useCallback, useState } from 'react';
import { logger } from '@/utils/logger';

interface UseAccessibilityOptions {
  enableKeyboardNavigation?: boolean;
  enableScreenReaderOptimizations?: boolean;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
}

export const useAccessibility = ({
  enableKeyboardNavigation = true,
  enableScreenReaderOptimizations = true,
  enableHighContrast = false,
  enableReducedMotion = true
}: UseAccessibilityOptions = {}) => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [preferReducedMotion, setPreferReducedMotion] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);

  // Detect keyboard usage
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = () => setIsKeyboardUser(true);
    const handleMouseDown = () => setIsKeyboardUser(false);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enableKeyboardNavigation]);

  // Detect reduced motion preference
  useEffect(() => {
    if (!enableReducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPreferReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPreferReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableReducedMotion]);

  // High contrast mode detection
  useEffect(() => {
    if (!enableHighContrast) return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrastMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHighContrastMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableHighContrast]);

  // Focus management utilities
  const focusElement = useCallback((selector: string, delay = 0) => {
    setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
        logger.debug('Focused element', { selector });
      }
    }, delay);
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReaderOptimizations) return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);
    setTimeout(() => document.body.removeChild(announcer), 1000);

    logger.debug('Screen reader announcement', { message, priority });
  }, [enableScreenReaderOptimizations]);

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded';
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      focusElement(`#${targetId}`);
    });

    return skipLink;
  }, [focusElement]);

  return {
    isKeyboardUser,
    preferReducedMotion,
    highContrastMode,
    focusElement,
    trapFocus,
    announce,
    createSkipLink,
    accessibilityClasses: {
      'focus-visible': isKeyboardUser,
      'reduce-motion': preferReducedMotion,
      'high-contrast': highContrastMode
    }
  };
};

// Accessibility utilities
export const getAriaLabel = (element: string, action?: string, context?: string): string => {
  let label = element;
  if (action) label += ` ${action}`;
  if (context) label += ` in ${context}`;
  return label;
};

export const getKeyboardShortcutText = (keys: string[]): string => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return keys.map(key => {
    if (key === 'cmd' && !isMac) return 'Ctrl';
    if (key === 'ctrl' && isMac) return 'Cmd';
    return key.charAt(0).toUpperCase() + key.slice(1);
  }).join(' + ');
};
