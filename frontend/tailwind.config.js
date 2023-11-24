import { withTV } from "tailwind-variants/dist/transformer";

/** @type {import('tailwindcss').Config} */
const PRIMARY = {
  50: "#f6f8ff",
  100: "#bfd6ff",
  200: "#a9cfff",
  300: "#76adff",
  400: "#4078ff",
  500: "#1645ff",
  600: "#0029ff",
  700: "#002cff",
  800: "#0027e1",
  900: "#0119af",
  950: "#010c65",
};

export default withTV({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        in: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        out: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        in: "in 0.2s ease-out",
        out: "out 0.2s ease-out",
      },
      colors: {
        hover: PRIMARY[100] + "55",
        active: PRIMARY[100] + "44",
        text: "#000",
        error: "#800",
        sucess: "#070",
        background: "#fff",
        accent: PRIMARY[900],
        popover: "white",
        "second-accent": PRIMARY[100] + "55",
      },
      screens: {
        tablet: "767px",
        laptop: "1024px",
        laptopHD: "1280px",
        desktop: "1600px",
        desktopHD: "1920px",
        wide: "2160px",
        ultraWide: "2560px",
      },
    },
  },
  plugins: [],
});
