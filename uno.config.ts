import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetWind3, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3({ preflight: false }),
    presetRemToPx({
      baseFontSize: 4, // mr-4 = 1rem;
    }),
  ],

  transformers: [transformerDirectives()],

  // https://github.com/unocss/unocss/issues/1620
  blocklist: ['container'],
})
