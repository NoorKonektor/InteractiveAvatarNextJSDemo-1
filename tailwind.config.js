/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Courier New", "monospace"],
        orbitron: ["Orbitron", "monospace"],
      },
      colors: {
        cyber: {
          cyan: '#00ffff',
          blue: '#0080ff', 
          purple: '#8b5cf6',
          pink: '#ff00ff',
          dark: '#0a0a0f',
          card: '#1a1a2e',
          glass: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(0, 255, 255, 0.3)',
        }
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
        'cyber-radial': 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.05) 0%, transparent 70%)',
        'neon-gradient': 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(128, 0, 255, 0.1))',
        'holographic': 'linear-gradient(45deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 25%, rgba(0, 255, 0, 0.1) 50%, rgba(255, 255, 0, 0.1) 75%, rgba(0, 255, 255, 0.1) 100%)',
      },
      boxShadow: {
        'neon': '0 0 10px var(--primary-cyan), 0 0 20px var(--primary-cyan), 0 0 40px var(--primary-cyan)',
        'neon-sm': '0 0 5px rgba(0, 255, 255, 0.5)',
        'neon-lg': '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)',
        'cyber': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'cyber-inset': 'inset 0 0 20px rgba(0, 255, 255, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'matrix-rain': 'matrix-rain 3s linear infinite',
        'holographic-shift': 'holographic-shift 3s ease infinite',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3), 0 0 20px rgba(0, 255, 255, 0.2), 0 0 40px rgba(0, 255, 255, 0.1)'
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4), 0 0 80px rgba(0, 255, 255, 0.2)'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'scan-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' }
        },
        'holographic-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  darkMode: "class",
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 255, 255, 0.1), inset 0 1px 0 rgba(0, 255, 255, 0.1)',
        },
        '.neon-glow': {
          boxShadow: '0 0 10px var(--tw-shadow-color, #00ffff), 0 0 20px var(--tw-shadow-color, #00ffff), 0 0 40px var(--tw-shadow-color, #00ffff)',
        },
        '.neon-border': {
          border: '1px solid #00ffff',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.1)',
        },
        '.neon-text': {
          color: '#00ffff',
          textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
        },
        '.cyber-grid': {
          backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          position: 'relative',
        },
        '.scan-lines': {
          position: 'relative',
          overflow: 'hidden',
        },
        '.scan-lines::after': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.05) 2px, rgba(0, 255, 255, 0.05) 4px)',
          pointerEvents: 'none',
          animation: 'scan-line 2s linear infinite',
        },
        '.cyber-button': {
          position: 'relative',
          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(128, 0, 255, 0.1))',
          border: '1px solid #00ffff',
          color: '#00ffff',
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '1px',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        },
        '.cyber-button::before': {
          content: '""',
          position: 'absolute',
          top: '0',
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent)',
          transition: 'left 0.5s',
        },
        '.cyber-button:hover::before': {
          left: '100%',
        },
        '.cyber-button:hover': {
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.1)',
          transform: 'translateY(-2px)',
        },
        '.holographic': {
          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 25%, rgba(0, 255, 0, 0.1) 50%, rgba(255, 255, 0, 0.1) 75%, rgba(0, 255, 255, 0.1) 100%)',
          backgroundSize: '400% 400%',
          animation: 'holographic-shift 3s ease infinite',
        },
        '.cyber-spinner': {
          border: '2px solid rgba(0, 255, 255, 0.1)',
          borderTop: '2px solid #00ffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
