import type { Config } from "tailwindcss";

// NOTE (flagged for Amber): exact hex values below are a warm, "Rain"-themed
// placeholder palette. We could not browse KarlyRain.com from this build
// environment (network egress to it was blocked), so these are our best
// compassionate-but-urgent guess, NOT pulled from the live site. Before
// launch, check these against KarlyRain.com / KarlyRainMatters.com and
// swap values here — every color in the site pulls from this one place.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rain: {
          50: "#fdf5f4",
          100: "#fbe9e7",
          200: "#f5cdc8",
          300: "#eba9a1",
          400: "#dd7a6f",
          500: "#c8483a", // primary action red/rose — "Rain" red
          600: "#ac332a",
          700: "#8c2823",
          800: "#722320",
          900: "#5f201f",
        },
        blush: {
          50: "#fff8f6",
          100: "#fdece7",
          200: "#fad6cb",
        },
        ink: {
          900: "#2b2320",
          700: "#4a3f3b",
          500: "#766a65",
        },
        cream: "#fbf6ef",
        gold: "#e8b34c",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(43, 35, 32, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
