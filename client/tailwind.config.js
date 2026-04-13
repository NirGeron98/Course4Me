// Tailwind design tokens for the Course4Me "Elegant & Minimalist" system.
// See client/UI_REFINEMENTS.md for usage guidelines and primitive component APIs.
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-red-500", "border-red-500", "text-red-500",
    "bg-yellow-500", "border-yellow-500", "text-yellow-500",
    "bg-orange-500", "border-orange-500", "text-orange-500",
    "bg-green-500", "border-green-500", "text-green-500",
    "bg-purple-500", "border-purple-500", "text-purple-500",
  ],
  theme: {
    extend: {
      // Semantic color tokens. Prefer these over raw gray-X so color tweaks
      // can happen in one place.
      colors: {
        surface: "#f8fafc",
        "surface-raised": "#ffffff",
        "surface-sunken": "#f1f5f9",
        muted: "#64748b",
        "muted-strong": "#475569",
        brand: {
          DEFAULT: "#059669",
          soft: "#d1fae5",
          strong: "#047857",
        },
        danger: {
          DEFAULT: "#dc2626",
          soft: "#fee2e2",
          strong: "#b91c1c",
        },
      },
      textColor: {
        muted: "#64748b",
        "muted-strong": "#475569",
      },
      backgroundColor: {
        surface: "#f8fafc",
        "surface-raised": "#ffffff",
        "surface-sunken": "#f1f5f9",
      },
      borderRadius: {
        card: "1rem",
        "card-lg": "1.25rem",
        button: "0.75rem",
      },
      boxShadow: {
        // Subtle shadow for regular cards / list rows.
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover":
          "0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
        // Stronger shadow for modals, popovers, menus.
        elevated:
          "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.10)",
        "elevated-lg":
          "0 25px 50px -12px rgb(15 23 42 / 0.25)",
      },
      transitionDuration: {
        ui: "200ms",
      },
      transitionTimingFunction: {
        ui: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        modalEnter: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        backdropEnter: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        modalEnter: "modalEnter 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        backdropEnter: "backdropEnter 200ms ease-out",
        fadeIn: "fadeIn 200ms ease-out",
      },
    },
  },
  plugins: [],
};
