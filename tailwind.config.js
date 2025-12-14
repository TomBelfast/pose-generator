/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // ========================================
        // LIGHT MODE - Neumorphism (soft gray)
        // ========================================
        'neu': {
          'base': '#e0e5ec',
          'dark': '#a3b1c6',
          'light': '#ffffff',
          'surface': '#e0e5ec',
          'accent': '#6366f1',
          'accent-hover': '#4f46e5',
          'success': '#10b981',
          'danger': '#ef4444',
          // DARK text for light mode (high contrast)
          'text': '#1a1a1a',           // Very dark - almost black
          'text-muted': '#374151',     // Dark gray
          'text-light': '#4b5563',     // Medium-dark gray
        },

        // ========================================
        // DARK MODE - Steel/Titanium gray
        // ========================================
        'neu-dark': {
          'base': '#3d4349',           // Steel gray background
          'dark': '#2a2e33',           // Darker shadow
          'light': '#50575f',          // Lighter shadow
          'surface': '#3d4349',        // Surface color
          'accent': '#818cf8',
          'accent-hover': '#6366f1',
          'success': '#34d399',
          'danger': '#f87171',
          'text': '#f0f2f5',
          'text-muted': '#c9cdd4',
          'text-light': '#9ca3af',
        },

        // Legacy colors for compatibility
        'brand-primary': '#6366f1',
        'brand-secondary': '#4f46e5',
        'brand-light': '#e0e7ff',
        'base-100': '#e0e5ec',
        'base-200': '#e0e5ec',
        'base-300': '#d1d5db',
        'base-content': '#1a1a1a',
      },
      boxShadow: {
        // ========================================
        // LIGHT MODE shadows
        // ========================================
        'neu': '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
        'neu-lg': '12px 12px 24px #a3b1c6, -12px -12px 24px #ffffff',
        'neu-xl': '20px 20px 40px #a3b1c6, -20px -20px 40px #ffffff',
        'neu-inset': 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
        'neu-inset-sm': 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff',
        'neu-inset-lg': 'inset 8px 8px 16px #a3b1c6, inset -8px -8px 16px #ffffff',
        'neu-hover': '10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff',
        'neu-focus': '0 0 0 3px rgba(99, 102, 241, 0.4), 8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
        'neu-flat': '0 0 0 transparent',

        // ========================================
        // DARK MODE shadows - steel/titanium
        // ========================================
        'neu-dark': '6px 6px 12px #2a2e33, -6px -6px 12px #50575f',
        'neu-dark-sm': '3px 3px 6px #2a2e33, -3px -3px 6px #50575f',
        'neu-dark-lg': '10px 10px 20px #2a2e33, -10px -10px 20px #50575f',
        'neu-dark-inset': 'inset 4px 4px 8px #2a2e33, inset -4px -4px 8px #50575f',
        'neu-dark-inset-sm': 'inset 2px 2px 4px #2a2e33, inset -2px -2px 4px #50575f',
        'neu-dark-hover': '8px 8px 16px #2a2e33, -8px -8px 16px #50575f',
        'neu-dark-focus': '0 0 0 3px rgba(129, 140, 248, 0.4), 6px 6px 12px #2a2e33, -6px -6px 12px #50575f',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        }
      },
      borderRadius: {
        'neu': '16px',
        'neu-sm': '12px',
        'neu-lg': '24px',
      },
    },
  },
  plugins: [],
}
