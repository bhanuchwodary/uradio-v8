
import React, { useEffect } from 'react';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/utils/responsive';
import { useAccessibility } from '@/hooks/useAccessibility';
import { getVolumePreference, saveVolumePreference } from '@/utils/volumeStorage';

interface EnhancedAppLayoutProps {
  children: React.ReactNode;
}

export const EnhancedAppLayout: React.FC<EnhancedAppLayoutProps> = ({ children }) => {
  const [volume, setVolume] = React.useState(() => getVolumePreference());
  const [randomMode, setRandomMode] = React.useState(false);
  
  const { isMobile, isTablet } = useResponsive();
  const { preferReducedMotion, createSkipLink } = useAccessibility();

  // Save volume preference whenever it changes
  useEffect(() => {
    saveVolumePreference(volume);
  }, [volume]);

  // Add skip links for accessibility
  useEffect(() => {
    const skipToMain = createSkipLink('main-content', 'Skip to main content');
    const skipToNav = createSkipLink('bottom-nav', 'Skip to navigation');
    
    document.body.insertBefore(skipToMain, document.body.firstChild);
    document.body.insertBefore(skipToNav, document.body.firstChild);

    return () => {
      document.body.removeChild(skipToMain);
      document.body.removeChild(skipToNav);
    };
  }, [createSkipLink]);

  return (
    <div className={cn(
      'min-h-screen flex flex-col',
      'bg-gradient-to-br from-surface-container-lowest via-surface to-surface-container',
      'dark:from-surface-dim dark:via-surface dark:to-surface-bright',
      'ios-vh-fix ios-no-bounce',
      preferReducedMotion ? 'motion-reduce' : 'motion-safe'
    )}>
      <AppHeader 
        randomMode={randomMode} 
        setRandomMode={setRandomMode} 
        volume={volume} 
        setVolume={setVolume} 
      />
      
      <main
        id="main-content"
        className={cn(
          'flex-grow overflow-x-hidden w-full ios-smooth-scroll',
          'ios-safe-left ios-safe-right',
          'pt-20', // Account for fixed header
          isMobile ? 'pb-32' : isTablet ? 'pb-28' : 'pb-20',
          preferReducedMotion ? '' : 'transition-all duration-300 ease-out'
        )}
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
      
      <BottomNav id="bottom-nav" />
    </div>
  );
};
