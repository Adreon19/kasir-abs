/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        "custom-light": "4px 4px 10px rgba(0, 0, 0, 0.1)", // Light shadow
        "custom-dark": "2px 2px 2px 2px rgba(0, 0, 0, 0.6)", // Dark shadow
        "custom-blue": "0px 4px 20px rgba(0, 0, 255, 0.2)", // Blue shadow

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
  },
  plugins: [require("tailwindcss-primeui")],
  // safelist: ['min-w-[800px]', 'overflow-x-auto'],
};
