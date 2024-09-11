/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust paths based on your project structure
  ],
  theme: {
    extend: {},
    container: {
      padding: {
        md: "10rem",
      },
    },
  },
  plugins: [],
};
