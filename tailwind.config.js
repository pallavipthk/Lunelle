/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFCF6',
        card: '#FFFFFF',
        'pale-sage': '#DFE8DA',
        'botanical-green': '#A9BFA6',
        'deep-sage': '#345344',
        'dusty-rose': '#F2E0DB',
        'muted-rose': '#B77D78',
        'butter-cream': '#F6EACB',
        'text-primary': '#303B33',
        'text-secondary': '#778078',
        'border-soft': '#E9E6DD',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Quicksand"', '"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        soft: ['"Quicksand"', '"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        cute: ['"Quicksand"', '"Nunito"', '"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(52, 83, 68, 0.05)',
        'soft-md': '0 8px 30px -4px rgba(52, 83, 68, 0.08)',
        'soft-lg': '0 14px 40px -6px rgba(52, 83, 68, 0.1)',
      },
      borderRadius: {
        'card': '20px',
        'card-lg': '24px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
