import { createRemToPxProcessor } from '@unocss/preset-wind4/utils'
import { defineConfig, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  transformers: [transformerDirectives(), transformerVariantGroup()],

  presets: [
    presetWind4({
      preflights: {
        reset: false,
        theme: { mode: 'on-demand', process: createRemToPxProcessor() },
      },
      dark: { dark: '.bilibili-gate-using-dark' },
    }),
  ],

  postprocess: [createRemToPxProcessor()],

  // https://github.com/unocss/unocss/issues/1620
  blocklist: ['container'],

  theme: {
    colors: {
      gate: {
        primary: 'var(--bilibili-gate--color-primary)',
        bg: 'var(--bilibili-gate--bg)',
        border: 'var(--bilibili-gate--border-color)',
      },
    },
  },

  shortcuts: {
    'flex-v-center': 'flex items-center',
    'flex-center': 'flex items-center justify-center',
    'inline-flex-center': 'inline-flex items-center justify-center',

    'icon-only-round-button': 'flex-center size-32px p-0 rounded-50%',
    'inline-icon-only-round-button': 'inline-flex-center size-32px p-0 rounded-50%',
  },
})
