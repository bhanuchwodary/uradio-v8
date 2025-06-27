
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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'handwritten': ['Kalam', 'cursive'],
      },
      colors: {
        // Material Design 3 System Colors
        'md-sys-color': {
          primary: "rgb(var(--md-sys-color-primary) / <alpha-value>)",
          'on-primary': "rgb(var(--md-sys-color-on-primary) / <alpha-value>)",
          'primary-container': "rgb(var(--md-sys-color-primary-container) / <alpha-value>)",
          'on-primary-container': "rgb(var(--md-sys-color-on-primary-container) / <alpha-value>)",
          secondary: "rgb(var(--md-sys-color-secondary) / <alpha-value>)",
          'on-secondary': "rgb(var(--md-sys-color-on-secondary) / <alpha-value>)",
          'secondary-container': "rgb(var(--md-sys-color-secondary-container) / <alpha-value>)",
          'on-secondary-container': "rgb(var(--md-sys-color-on-secondary-container) / <alpha-value>)",
          tertiary: "rgb(var(--md-sys-color-tertiary) / <alpha-value>)",
          'on-tertiary': "rgb(var(--md-sys-color-on-tertiary) / <alpha-value>)",
          'tertiary-container': "rgb(var(--md-sys-color-tertiary-container) / <alpha-value>)",
          'on-tertiary-container': "rgb(var(--md-sys-color-on-tertiary-container) / <alpha-value>)",
          error: "rgb(var(--md-sys-color-error) / <alpha-value>)",
          'on-error': "rgb(var(--md-sys-color-on-error) / <alpha-value>)",
          'error-container': "rgb(var(--md-sys-color-error-container) / <alpha-value>)",
          'on-error-container': "rgb(var(--md-sys-color-on-error-container) / <alpha-value>)",
          surface: "rgb(var(--md-sys-color-surface) / <alpha-value>)",
          'on-surface': "rgb(var(--md-sys-color-on-surface) / <alpha-value>)",
          'surface-variant': "rgb(var(--md-sys-color-surface-variant) / <alpha-value>)",
          'on-surface-variant': "rgb(var(--md-sys-color-on-surface-variant) / <alpha-value>)",
          'surface-container-lowest': "rgb(var(--md-sys-color-surface-container-lowest) / <alpha-value>)",
          'surface-container-low': "rgb(var(--md-sys-color-surface-container-low) / <alpha-value>)",
          'surface-container': "rgb(var(--md-sys-color-surface-container) / <alpha-value>)",
          'surface-container-high': "rgb(var(--md-sys-color-surface-container-high) / <alpha-value>)",
          'surface-container-highest': "rgb(var(--md-sys-color-surface-container-highest) / <alpha-value>)",
          outline: "rgb(var(--md-sys-color-outline) / <alpha-value>)",
          'outline-variant': "rgb(var(--md-sys-color-outline-variant) / <alpha-value>)",
          'surface-tint': "rgb(var(--md-sys-color-surface-tint) / <alpha-value>)",
          'inverse-surface': "rgb(var(--md-sys-color-inverse-surface) / <alpha-value>)",
          'inverse-on-surface': "rgb(var(--md-sys-color-inverse-on-surface) / <alpha-value>)",
          'inverse-primary': "rgb(var(--md-sys-color-inverse-primary) / <alpha-value>)",
        },
        // Legacy compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Legacy M3 shortcuts for existing components
        "surface-container": "hsl(var(--surface-container))",
        "surface-container-high": "hsl(var(--surface-container-high))",
        "on-surface": "hsl(var(--on-surface))",
        "on-surface-variant": "hsl(var(--on-surface-variant))",
        "outline-variant": "hsl(var(--outline-variant))",
        "primary-container": "hsl(var(--primary-container))",
        "on-primary-container": "hsl(var(--on-primary-container))",
        "secondary-container": "hsl(var(--secondary-container))",
        "on-secondary-container": "hsl(var(--on-secondary-container))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
