/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BeatStars/Suno/Pro Tools inspired colors
        glass: {
          purple: {
            50: 'rgba(168, 85, 247, 0.05)',
            100: 'rgba(168, 85, 247, 0.1)',
            200: 'rgba(168, 85, 247, 0.2)',
            300: 'rgba(168, 85, 247, 0.3)',
            400: 'rgba(168, 85, 247, 0.4)',
            500: 'rgba(168, 85, 247, 0.5)',
            600: 'rgba(168, 85, 247, 0.6)',
            700: 'rgba(168, 85, 247, 0.7)',
            800: 'rgba(168, 85, 247, 0.8)',
            900: 'rgba(168, 85, 247, 0.9)',
          }
        },
        background: {
          dark: '#0a0a0a',
          light: '#ffffff',
        },
        surface: {
          dark: '#1a1a1a',
          light: '#f5f5f5',
        },
        'surface-elevated': {
          dark: '#2a2a2a',
          light: '#e5e5e5',
        },
        border: {
          dark: '#333333',
          light: '#d4d4d4',
        },
        accent: {
          primary: '#a855f7',
          secondary: '#c084fc',
          tertiary: '#e9d5ff',
        },
        success: '#00ff88',
        warning: '#ffaa00',
        danger: '#ff3366',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.6875rem', // 11px
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.5rem',       // 24px
      },
      spacing: {
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        12: '3rem',     // 48px
        16: '4rem',     // 64px
      },
      borderRadius: {
        control: '0.25rem',  // 4px
        panel: '0.5rem',     // 8px
        modal: '0.75rem',    // 12px
      },
      boxShadow: {
        'glass-sm': '0 2px 16px rgba(168, 85, 247, 0.1), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'glass-md': '0 4px 24px rgba(168, 85, 247, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)',
        'glass-lg': '0 8px 32px rgba(168, 85, 247, 0.2), 0 8px 24px rgba(0, 0, 0, 0.5)',
        'inner-glow': 'inset 0 1px 2px rgba(168, 85, 247, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
