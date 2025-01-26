/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brown: "#634F2B",
        surface: {
          700: "#374151",
          500: "#817457",
          200: "#E5E7EB",
        },
      },
    },
  },
  plugins: [require("tailwindcss-primeui")],
};
