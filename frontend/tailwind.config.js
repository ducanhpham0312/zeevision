import { withTV } from "tailwind-variants/dist/transformer";

/** @type {import('tailwindcss').Config} */
const PRIMARY = {
  50: "#f6f8ff",
  100: "#cfe6ff",
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
      colors: {
        hover: PRIMARY[50],
        active: PRIMARY[100],
        text: "#000",
        error: "#800",
        sucess: "#070",
        background: "#fff",
        accent: PRIMARY[900],
      },
    },
  },
  plugins: [],
});
