import type { Config } from "tailwindcss";

// PALETTE STATUS (flagged for Amber — read before changing):
//
// Previously this file held a placeholder rose/cream guess because the
// build environment couldn't reach KarlyRain.com at all. It has now been
// updated to a hot-pink / black / white palette per your direct
// description: "bright pink/magenta with black nav and white background
// ... header banner hot pink (~#E6007E-#EC1E79 range) ... nav bar black
// ... body white ... headline text black."
//
// IMPORTANT CAVEAT: this build environment still cannot reach
// karlyrain.com, karlyrainwoodact.com, or sites.google.com (organization
// network policy blocks all three — confirmed via curl, WebFetch, and the
// proxy's own status log, not a transient failure). That means the exact
// hex below (#e6007e) was NOT sampled by me from a real screenshot or
// pixel-picked from the live site — it's the first value in the range you
// gave me. Please pixel-sample the real header banner yourself (e.g.
// browser DevTools color picker, or drop a screenshot here) and correct
// `rain[500]` below if it's off; the rest of the ramp (50-900) was
// generated programmatically as tints/shades of that one value, so fixing
// `500` and regenerating the ramp is the only edit needed if the exact hex
// changes.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rain: {
          50: "#ffebf6",
          100: "#ffd6ed",
          200: "#ffa8d8",
          300: "#ff66ba",
          400: "#ff1a97",
          500: "#e6007e", // primary hot pink/magenta — unverified exact value, see caveat above
          600: "#b30062",
          700: "#800046",
          800: "#570030",
          900: "#39001f",
        },
        // Soft pink tints for secondary surfaces (chips, gradients) — same
        // hue family as `rain`, just lighter, so they read as one palette.
        blush: {
          50: "#ffebf6",
          100: "#ffd6ed",
          200: "#ffa8d8",
        },
        ink: {
          900: "#0d0d0d", // near-black, for headline text / "black nav" contrast
          700: "#2b2b2b",
          500: "#5c5c5c",
        },
        cream: "#ffffff", // legacy token name; value is now real white per "body white"
        gold: "#e8b34c", // unverified secondary accent — no secondary accent color was given; keep, adjust, or drop once confirmed
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(13, 13, 13, 0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
