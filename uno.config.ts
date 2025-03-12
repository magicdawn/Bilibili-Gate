import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetWind3, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3({ preflight: false }),
    presetRemToPx({
      baseFontSize: 4, // mr-4 = 1rem;
    }),
  ],

  // https://github.com/unocss/unocss/issues/1620
  blocklist: ['container'],

  rules: [
    // `size-15` or `size-15px`
    [/^size-([.\d]+)(?:px)?$/, ([_, num]) => ({ width: `${num}px`, height: `${num}px` })],
  ],

  transformers: [transformerDirectives()],
})
