import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 英文用 Playfair (优雅)，中文用 Noto Serif SC 或 宋体
        serif: ["var(--font-playfair)", "Noto Serif SC", "Songti SC", "SimSun", "serif"],
        // 正文用 Inter，中文用 苹方/微软雅黑
        sans: ["var(--font-inter)", "PingFang SC", "Microsoft YaHei", "sans-serif"],
      },
      colors: {
        // 再次确认一下这个配色盘，这是"高知感"的核心
        background: "#FAFAF9", // 暖米色 (Warm Stone)
        foreground: "#1C1917", // 深炭灰
        primary: {
          DEFAULT: "#1A2E26", // 英国赛车绿 (British Racing Green)
          foreground: "#FAFAF9",
        },
        muted: "#78716C", // 暖灰色
      }
    },
  },
  plugins: [],
};
export default config;
