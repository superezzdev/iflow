import type { Config } from 'tailwindcss';
import basePreset from '../../packages/config/tailwind.base.js';

export default {
  content: ['./src/**/*.{html,ts,tsx}'],
  presets: [basePreset],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
