/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Example customizations (optional)
      colors: {
        primary: "#2563eb",
        secondary: "#9333ea",
      },
    },
  },
  plugins: [],
};
