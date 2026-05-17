/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        green: {
          neon: '#00ff88',
          bright: '#00e676',
          primary: '#00c853',
          dark: '#1b5e20',
          deeper: '#0d3318',
          900: '#1a2e1a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 5px #00ff88, 0 0 10px #00ff88' },
          '100%': { 'box-shadow': '0 0 20px #00ff88, 0 0 40px #00ff8844' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [],
}
