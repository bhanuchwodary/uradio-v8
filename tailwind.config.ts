
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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
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
				
				// Legacy compatibility
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
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
