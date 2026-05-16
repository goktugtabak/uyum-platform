const sharedConfig = require('../shared/tailwind.config')

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...sharedConfig,
  content: ['./index.html', './src/**/*.{ts,tsx}'],
}
