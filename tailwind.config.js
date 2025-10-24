/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      base: 18,
      lg: 20,
      xl: 22,
      "2xl": 24,
    },
    extend: {
      colors: {
        primary: "var(--primary)",
        primaryTextColor: "var(--primaryTextColor)",
        buttonColor: "var(--buttonColor)",
        buttonTextColor: "var(--buttonTextColor)",
        iconColor: "var(--iconColor)",
        notificationBadgeColor: "var(--notificationBadgeColor)",
        readyStatusColor: "var(--readyStatusColor)",
        pendingStatusColor: "var(--pendingStatusColor)",

        defaultBlack: "var(--defaultBlack)",
        defaultWhite: "var(--defaultWhite)",
        defaultBackgroundColor: "var(--defaultBackgroundColor)",
        darkGray: "var(--darkGray)",
      },
      borderRadius: {
        sm: "4",
        md: "6",
        lg: "8",
      },
    },
  },
  plugins: [
    require("nativewind/babel"),
    ({ addBase }) =>
      addBase({
        ":root": {
          "--primary": "#082a59",
          "--primaryTextColor": "#000000",
          "--buttonColor": "#f2192a",
          "--buttonTextColor": "#ffffff",
          "--iconColor": "#082a59",
          "--notificationBadgeColor": "#e74c3c",
          "--readyStatusColor": "#2ecc71",
          "--pendingStatusColor": "#e67e22",

          "--defaultBlack": "#000000",
          "--defaultWhite": "#FFFFFF",
          "--defaultBackgroundColor": "#DDD",
          "--darkGray": "#808080",
        },
      }),
  ],
};
