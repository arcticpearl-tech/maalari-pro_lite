import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // DESIGN.md palette
        background: "#F7F7F5",
        surface: "#FFFFFF",
        "surface-subtle": "#F1F2EE",
        foreground: "#1F2937",
        muted: "#5B6470",
        border: "#D9DDD6",
        accent: {
          DEFAULT: "#7FA38A",
          foreground: "#FFFFFF",
        },
        success: "#6F9B76",
        warning: "#D6A85F",
        error: "#C97C74",
        info: "#7A97B8",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
