
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 800,
} as const;

export const EASING_FUNCTIONS = {
  EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const SPRING_CONFIGS = {
  GENTLE: { tension: 280, friction: 60 },
  WOBBLY: { tension: 180, friction: 12 },
  STIFF: { tension: 210, friction: 20 },
} as const;

// Animation utility classes
export const createRippleEffect = (element: HTMLElement, event: MouseEvent) => {
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 600ms linear;
    pointer-events: none;
  `;
  
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL / 1000 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: ANIMATION_DURATIONS.FAST / 1000 }
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: ANIMATION_DURATIONS.NORMAL / 1000 }
};
