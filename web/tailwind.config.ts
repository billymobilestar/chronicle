import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cobalt: {
          DEFAULT: "#0A1A3F",
          light: "#0F2251",
          dark: "#060E22",
        },
        "french-blue": "#1E3566",
        wisteria: "#7B8FAD",
        "pale-sky": "#D0D6DF",
        cream: "#F0EDE6",
        offwhite: "#F7F6F3",
        accent: {
          DEFAULT: "#6D3AC8",
          hover: "#5B2EA8",
          light: "#9680C4",
          glow: "#8B5CF6",
        },
        neon: "#C4FF6B",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        body: ["var(--font-space)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 10vw, 9rem)", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.8rem, 4vw, 3rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
      backgroundImage: {
        "gradient-cobalt": "linear-gradient(135deg, #0A1A3F 0%, #1E3566 100%)",
        "gradient-accent": "linear-gradient(135deg, #6D3AC8 0%, #1E3566 100%)",
        "gradient-editorial": "linear-gradient(180deg, #0A1A3F 0%, #060E22 100%)",
      },
      animation: {
        "marquee": "marquee 25s linear infinite",
        "marquee-reverse": "marquee-reverse 25s linear infinite",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
