import type { Config } from 'tailwindcss';
import basePreset from '../../packages/config/tailwind.base.js';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [basePreset],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
