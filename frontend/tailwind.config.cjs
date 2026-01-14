module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        metron: {
          purple: '#A855F7',
          blue: '#3B82F6',
          pink: '#D946EF',
          dark: '#0A0A0A',
          darker: '#000000',
        },
        brand: {
          from: '#A855F7',
          via: '#8B5CF6',
          to: '#3B82F6',
        }
      },
      backgroundImage: {
        'gradient-metron': 'linear-gradient(135deg, #A855F7 0%, #8B5CF6 50%, #3B82F6 100%)',
        'gradient-dark': 'linear-gradient(to bottom, #0A0A0A, #000000)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow': '0 0 40px rgba(168, 85, 247, 0.3)',
      },
    },
  },
  plugins: [],
}