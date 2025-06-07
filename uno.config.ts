import { presetRemToPx } from '@unocss/preset-rem-to-px'
import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'

export default defineConfig({
  transformers: [transformerDirectives(), transformerVariantGroup()],

  presets: [
    presetRemToPx(),
    presetWind3({
      preflight: 'on-demand',
      dark: { dark: '.bilibili-gate-using-dark' },
    }),
  ],

  // https://github.com/unocss/unocss/issues/1620
  blocklist: ['container'],

  theme: {
    colors: {
      gate: {
        primary: 'var(--bilibili-gate--color-primary)',
        border: 'var(--bilibili-gate--border-color)',
        bg: {
          DEFAULT: 'var(--bilibili-gate--bg)',
          lv: {
            1: 'var(--bilibili-gate--bg-lv1)',
            2: 'var(--bilibili-gate--bg-lv2)',
            3: 'var(--bilibili-gate--bg-lv3)',
          },
        },
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
