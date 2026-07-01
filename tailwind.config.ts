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
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: "#22d3ee",
          hover: "#67e8f9",
        },
        surface: {
          DEFAULT: "rgba(30, 41, 59, 0.6)",
          hover: "rgba(30, 41, 59, 0.8)",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(34, 211, 238, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
