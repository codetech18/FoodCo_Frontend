/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Clash Display for all font-display headings
        display: ["'Clash Display'", "sans-serif"],
        // Plus Jakarta Sans for body text
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        //display: ['"Playfair Display"', 'serif'],
        //sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        accent: "#fa5631",
        dark: {
          900: "#0a0a0a",
          800: "#111111",
          700: "#1a1a1a",
          600: "#222222",
        },
      },
    },
  },
  plugins: [],
};
