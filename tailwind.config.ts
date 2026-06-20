import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 株式会社ライフアップ ブランドオレンジ
        brand: {
          50: "#FFF3EA",
          100: "#FFE1C9",
          200: "#FFC393",
          300: "#FFA05C",
          400: "#FF8330",
          500: "#FF6A13", // primary
          600: "#F2570C",
          700: "#C7440A",
          800: "#9E370F",
          900: "#7F2F11",
          950: "#451506",
        },
        // 黒系ニュートラル（黒オレンジ配色のベース）
        ink: {
          50: "#F6F6F7",
          100: "#E9E9EC",
          200: "#C9C9D0",
          300: "#A0A0AB",
          400: "#6E6E7B",
          500: "#4B4B57",
          600: "#33333D",
          700: "#26262E",
          800: "#1A1A20",
          900: "#121216",
          950: "#0B0B0E",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "Noto Sans JP",
          "Meiryo",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,106,19,0.25), 0 8px 30px -8px rgba(255,106,19,0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #FF8330 0%, #F2570C 55%, #C7440A 100%)",
        "ink-radial":
          "radial-gradient(1200px 600px at 80% -10%, rgba(255,106,19,0.10), transparent 60%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "wave": {
          "0%,100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(14deg)" },
          "75%": { transform: "rotate(-8deg)" },
        },
        "float": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        wave: "wave 1.6s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
