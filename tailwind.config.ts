// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/*.{js,ts,jsx,tsx,mdx}", // ← これを追記（すべての階層を対象にする）
    "!./node_modules/**",         // 念のため node_modules は除外
  ],
  theme: {
    extend: {
      fontFamily: {
        futura: ['"futura-pt"', 'sans-serif'],
        sans: ['"source-han-sans-japanese"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;