// tailwind.config.js – design tokens for consistent UI
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'bg-red-500', 'border-red-500', 'text-red-500',
    'bg-yellow-500', 'border-yellow-500', 'text-yellow-500',
    'bg-orange-500', 'border-orange-500', 'text-orange-500',
    'bg-green-500', 'border-green-500', 'text-green-500',
    'bg-purple-500', 'border-purple-500', 'text-purple-500',
  ],
  theme: {
    extend: {
      borderRadius: {
        card: '1rem',
        'card-lg': '1.25rem',
        button: '0.75rem',
      },
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
      },
      transitionDuration: {
        ui: '200ms',
      },
    },
  },
  plugins: [],
}
