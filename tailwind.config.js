/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          700: "#374151",
          200: "#E5E7EB",
        },
      },
    },
  },
  plugins: [require("tailwindcss-primeui")],
};
