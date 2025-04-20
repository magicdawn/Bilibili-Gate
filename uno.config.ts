import presetRemToPx from '@unocss/preset-rem-to-px'
import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3({ preflight: false }),
    presetRemToPx({
      // baseFontSize: 4, // mr-4 = 1rem;
    }),
  ],

  transformers: [transformerDirectives(), transformerVariantGroup()],

  // https://github.com/unocss/unocss/issues/1620
  blocklist: ['container'],

  theme: {
    colors: {
      gate: {
        primary: 'var(--bilibili-gate--color-primary)',
      },
    },
  },

  shortcuts: {
    'flex-v-center': 'flex items-center',
    'flex-center': 'flex items-center justify-center',

    'inline-flex-v-center': 'inline-flex items-center',
    'inline-flex-center': 'inline-flex items-center justify-center',

    'icon-only-round-button': 'flex-center size-32px p-0 rounded-50%',
    'inline-icon-only-round-button': 'inline-flex-center size-32px p-0 rounded-50%',
  },
})
