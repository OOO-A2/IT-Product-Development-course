/** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-sky-500",
    "bg-fuchsia-500",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

