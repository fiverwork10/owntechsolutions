module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        'primary-dark': '#6D28D9',
        'primary-light': '#A78BFA',
        background: '#0A0A0A',
        'background-light': '#141414',
        'background-card': '#1A1A1A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        'border-color': 'rgba(139, 92, 246, 0.2)',
        'glass-bg': 'rgba(139, 92, 246, 0.05)',
        'glass-border': 'rgba(139, 92, 246, 0.15)',
        'neon-glow': 'rgba(139, 92, 246, 0.5)',
        'neon-glow-strong': 'rgba(139, 92, 246, 0.8)',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'neon': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        'neon-strong': '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing': 'typing 0.5s ease-in-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)' }
        },
        typing: {
          '0%': { width: '0%', visibility: 'hidden' },
          '100%': { width: '100%' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },

      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
