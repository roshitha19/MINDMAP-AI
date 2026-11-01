/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          darkest: '#030712',
          darker: '#0B0F19',
          dark: '#0F172A',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(99, 102, 241, 0.2)',
          borderHover: 'rgba(139, 92, 246, 0.5)',
          violet: '#8B5CF6',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          glow: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
      },
      boxShadow: {
        'cosmic-sm': '0 0 15px -3px rgba(139, 92, 246, 0.25)',
        'cosmic-md': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'cosmic-lg': '0 0 40px -8px rgba(168, 85, 247, 0.45)',
        'cyan-glow': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0B0F19 0%, #0F172A 50%, #1E1B4B 100%)',
        'nebula-gradient': 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, rgba(3, 7, 18, 0) 70%)',
        'accent-gradient': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
