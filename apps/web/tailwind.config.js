// Import the shared Clara UI Tailwind theme (CommonJS)
const { claraTheme } = require('../../packages/ui/tailwind.theme.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,md}",
    "../../**/*.mdx",
    "../../**/*.md"
  ],
  theme: {
    ...claraTheme.theme,
  },
  darkMode: 'class',
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light", "dark"],
  },
};
