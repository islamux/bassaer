/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Tajawal', 'sans-serif'],
          amiri: ['Amiri', 'serif'],
        },
        textDirection: {
          rtl: 'rtl',
          ltr: 'ltr',
        },
      },
    },
    plugins: [],
  };