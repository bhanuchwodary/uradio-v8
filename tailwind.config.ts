
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      colors: {
        border: 'rgb(var(--border))',
        input: 'rgb(var(--input))',
        ring: 'rgb(var(--ring))',
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        
        // Enhanced Material Design 3 Surface Colors
        surface: {
          DEFAULT: 'rgb(var(--surface))',
          dim: 'rgb(var(--surface-dim))',
          bright: 'rgb(var(--surface-bright))',
          'container-lowest': 'rgb(var(--surface-container-lowest))',
          'container-low': 'rgb(var(--surface-container-low))',
          'container': 'rgb(var(--surface-container))',
          'container-high': 'rgb(var(--surface-container-high))',
          'container-highest': 'rgb(var(--surface-container-highest))',
        },
        
        'on-surface': {
          DEFAULT: 'rgb(var(--on-surface))',
          variant: 'rgb(var(--on-surface-variant))',
        },
        
        // Enhanced Material Design 3 Primary Colors
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--on-primary))',
          container: 'rgb(var(--primary-container))',
        },
        'on-primary': {
          DEFAULT: 'rgb(var(--on-primary))',
          container: 'rgb(var(--on-primary-container))',
        },
        
        // Enhanced Material Design 3 Secondary Colors
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          foreground: 'rgb(var(--on-secondary))',
          container: 'rgb(var(--secondary-container))',
        },
        'on-secondary': {
          DEFAULT: 'rgb(var(--on-secondary))',
          container: 'rgb(var(--on-secondary-container))',
        },
        
        // Enhanced Material Design 3 Tertiary Colors
        tertiary: {
          DEFAULT: 'rgb(var(--tertiary))',
          container: 'rgb(var(--tertiary-container))',
        },
        'on-tertiary': {
          DEFAULT: 'rgb(var(--on-tertiary))',
          container: 'rgb(var(--on-tertiary-container))',
        },
        
        // Enhanced Material Design 3 Error Colors
        error: {
          DEFAULT: 'rgb(var(--error))',
          container: 'rgb(var(--error-container))',
        },
        'on-error': {
          DEFAULT: 'rgb(var(--on-error))',
          container: 'rgb(var(--on-error-container))',
        },
        
        // Enhanced Material Design 3 Outline Colors
        outline: {
          DEFAULT: 'rgb(var(--outline))',
          variant: 'rgb(var(--outline-variant))',
        },
        
        // Enhanced legacy compatibility
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          foreground: 'rgb(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive))',
          foreground: 'rgb(var(--destructive-foreground))'
        },
        accent: {
          DEFAULT: 'rgb(var(--accent))',
          foreground: 'rgb(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'rgb(var(--popover))',
          foreground: 'rgb(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'rgb(var(--card))',
          foreground: 'rgb(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'rgb(var(--sidebar-background))',
          foreground: 'rgb(var(--sidebar-foreground))',
          primary: 'rgb(var(--sidebar-primary))',
          'primary-foreground': 'rgb(var(--sidebar-primary-foreground))',
          accent: 'rgb(var(--sidebar-accent))',
          'accent-foreground': 'rgb(var(--sidebar-accent-foreground))',
          border: 'rgb(var(--sidebar-border))',
          ring: 'rgb(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 12px)',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.15)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-out': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(10px)'
          }
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        'scale-out': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1'
          },
          '100%': {
            transform: 'scale(0.95)',
            opacity: '0'
          }
        },
        'slide-in-right': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'slide-out-right': {
          '0%': {
            transform: 'translateX(0)',
            opacity: '1'
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: '0'
          }
        },
        'slide-in-left': {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'bounce-subtle': {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          },
          '50%': {
            transform: 'translateY(-5px)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          }
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
          },
          '50%': {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
          }
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-200px 0'
          },
          '100%': {
            backgroundPosition: 'calc(200px + 100%) 0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'bounce-subtle': 'bounce-subtle 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite linear'
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
