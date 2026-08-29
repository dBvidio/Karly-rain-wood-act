import type { Config } from "tailwindcss";

// PALETTE STATUS (flagged for Amber — read before changing):
//
// These values were pulled directly from KarlyRain.com's live DOM via
// computed styles (not a screenshot guess) and confirmed by you as final:
//   - `pink-light` #f7a1da — top banner accent / lighter secondary accent
//   - `rain[500]`  #ab0e7b — dominant brand color (main section
//     backgrounds, buttons on the real site); used here as the primary
//     CTA/accent color, replacing the earlier #e6007e guess
//   - `black`      #000000 — nav/text
// The rest of the `rain` ramp (50-900) is generated tints/shades of
// #ab0e7b so every shade in the site stays one consistent hue family.
//
// This build environment still cannot reach karlyrain.com, sites.google.com,
// or karlyrainwoodact.com (organization network policy blocks all three),
// so these values are taken as given, not independently re-verified by me.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rain: {
          50: "#fdecf8",
          100: "#fbd0ee",
          200: "#f7a1da", // = pink-light, the lighter secondary/banner accent
          300: "#f368c8",
          400: "#ee2bb2",
          500: "#ab0e7b", // primary brand color — verified from KarlyRain.com computed styles
          600: "#850b60",
          700: "#600845",
          800: "#3a052a",
          900: "#1e0215",
        },
        // Named alias for the lighter secondary accent, matching how you
        // described it ("pink-light") — same value as rain[200].
        "pink-light": "#f7a1da",
        // Soft pink tints for secondary surfaces (chips, gradients) — same
        // hue family as `rain`, just lighter, so they read as one palette.
        blush: {
          50: "#fdecf8",
          100: "#fbd0ee",
          200: "#f7a1da",
        },
        ink: {
          900: "#000000", // true black, per verified "nav/text" black
          700: "#2b2b2b",
          500: "#5c5c5c",
        },
        cream: "#ffffff", // legacy token name; value is real white per "body white"
        gold: "#e8b34c", // unverified secondary accent — no accent color was confirmed for this; keep, adjust, or drop once confirmed
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0, 0, 0, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
