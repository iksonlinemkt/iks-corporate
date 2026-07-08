import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        iks: {
          navy: "#0B2D6B",
          navyDark: "#081F4D",
          navyLight: "#16409E",
          copper: "#C2703D",
          copperDark: "#A4592C",
          copperLight: "#E8C9AE",
          red: "#D14343",
          surface: "#F4F6FA",
          border: "#E2E6ED",
        },
      },
      fontFamily: {
        thai: ["'IBM Plex Sans Thai'", "'Sarabun'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
