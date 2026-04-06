/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Noto Sans Thai"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        surface: {
          DEFAULT: "hsl(220 20% 97%)",
          card: "hsl(0 0% 100%)",
          muted: "hsl(220 14% 96%)",
        },
        brand: {
          DEFAULT: "hsl(239 84% 67%)",
          soft: "hsl(239 84% 96%)",
        },
      },
      boxShadow: {
        card: "0 1px 3px hsl(220 20% 50% / 0.08), 0 8px 24px hsl(220 20% 40% / 0.06)",
        "card-hover":
          "0 4px 12px hsl(220 20% 50% / 0.1), 0 16px 40px hsl(220 20% 40% / 0.08)",
      },
    },
  },
  plugins: [],
};
