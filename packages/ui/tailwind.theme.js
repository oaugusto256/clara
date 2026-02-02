// Clara UI Tailwind Theme Extension
// This file exports a theme config for Tailwind CSS to be shared across Clara projects.

/** @type {import('tailwindcss').Config} */
const claraTheme = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6',  // blue-500
          dark: '#1e40af',   // blue-800
        },
        accent: {
          DEFAULT: '#f59e42', // orange-400
        },
        muted: {
          DEFAULT: '#f3f4f6', // gray-100
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        md: '0.5rem',
        lg: '1rem',
      },
    },
  },
};
module.exports = { claraTheme };
