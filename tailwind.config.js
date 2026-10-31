/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tiana: {
          primary: "#5BA66B",   
          dark: "#3F7D4A",      
          mint: "#B8D8B1",      
          gold: "#D4AF37",      
          cream: "#F8F1E1",     
          beige: "#E7D7B1",     
          brown: "#6B4F3A",     
          pearl: "#FFFDF7",
        }
      }
    },
  },
  plugins: [],
}