import type { Config } from "tailwindcss";
import { colors, typography, spacing, borderRadius, shadows, animations } from './config/theme';

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
  			border: colors.neutral[200],
  			input: colors.neutral[200],
  			ring: colors.primary[500],
  			background: colors.neutral[50],
  			foreground: colors.neutral[900],
  			primary: {
  				DEFAULT: colors.primary[500],
  				foreground: '#ffffff',
                    ...colors.primary
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			violet: {
  				'50': '#f5f3ff',
  				'100': '#ede9fe',
  				'200': '#ddd6fe',
  				'300': '#c4b5fd',
  				'400': '#a78bfa',
  				'500': '#8b5cf6',
  				'600': '#7c3aed',
  				'700': '#6d28d9',
  				DEFAULT: '#8b5cf6'
  			},
  			surface: {
  				DEFAULT: 'hsl(240 5% 7%)',
  				hover: 'hsl(240 5% 10%)',
  				elevated: 'hsl(240 5% 12%)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-mono)',
  				'ui-monospace',
  				'SFMono-Regular',
  				'monospace'
  			]
  		},
  		animation: {
  			'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
  			'fade-in': 'fadeIn 0.4s ease-out forwards',
  			shimmer: 'shimmer 1.5s infinite',
  			float: 'float 3s ease-in-out infinite'
  		},
  		boxShadow: {
  			glow: '0 0 20px -5px hsl(263 70% 58% / 0.15)',
  			'glow-lg': '0 0 40px -5px hsl(263 70% 58% / 0.2)'
  		}
  	}
  },
  plugins: [],
};
export default config;
