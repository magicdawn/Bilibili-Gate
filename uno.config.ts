import { presetRemToPx } from '@unocss/preset-rem-to-px'
import { createRemToPxProcessor } from '@unocss/preset-wind4/utils'
import { defineConfig, presetWind3, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'

const usingWind3 = defineConfig({
  presets: [
    presetRemToPx(),
    presetWind3({
      preflight: 'on-demand',
      dark: { dark: '.bilibili-gate-using-dark' },
    }),
  ],
})
const usingWind4 = defineConfig({
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
})

const USE_WIND4 = true
const usingConfig = USE_WIND4 ? usingWind4 : usingWind3

export default defineConfig({
  ...usingConfig,

  transformers: [transformerDirectives(), transformerVariantGroup()],

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
