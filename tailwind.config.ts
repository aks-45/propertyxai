import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-blue': '#2563EB',
        'dark-navy': '#0F172A',
        'light-blue-gray': '#F1F5F9',
        'success-green': '#16A34A',
        'warning-amber': '#F59E0B',
        'danger-red': '#DC2626',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '10px',
        input: '10px',
      },
    },
  },
  plugins: [],
};

export default config;
