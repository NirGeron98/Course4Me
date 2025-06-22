// tailwind.config.js
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
    extend: {},
  },
  plugins: [],
}
