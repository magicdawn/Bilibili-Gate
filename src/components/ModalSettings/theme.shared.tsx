import { PURPLE_COLORS } from 'purple-colors'
import { primaryColorValue } from '$components/css-vars'
import { $evolvedThemeColor } from '$header'
import { settings, useSettingsSnapshot } from '$modules/settings'
import LX_THEMES from './lx-themes.json'

// https://github.com/argyleink/gui-challenges/blob/main/color-palettes/oklch-palette.css
export const primaryPalatte = {
  swatch1: `oklch(from ${primaryColorValue} 99% .02 h)`,
  swatch2: `oklch(from ${primaryColorValue} 90% .1 h)`,
  swatch3: `oklch(from ${primaryColorValue} 80% .2 h)`,
  swatch4: `oklch(from ${primaryColorValue} 72% .25 h)`,
  swatch5: `oklch(from ${primaryColorValue} 67% .31 h)`,
  swatch6: `oklch(from ${primaryColorValue} 50% .27 h)`,
  swatch7: `oklch(from ${primaryColorValue} 35% .25 h)`,
  swatch8: `oklch(from ${primaryColorValue} 25% .2 h)`,
  swatch9: `oklch(from ${primaryColorValue} 13% .2 h)`,
  swatch10: `oklch(from ${primaryColorValue} 5% .1 h)`,
}

export interface LxTheme {
  id: string
  name: string
  isDark?: boolean
  isCustom?: boolean
  colorPrimary: string
  tooltip?: ReactNode
}

export const DEFAULT_BILI_PINK_THEME: LxTheme = {
  id: 'default-bili-pink',
  name: 'B站粉',
  isDark: false,
  isCustom: false,
  colorPrimary: '#ff6699',
}

export const COLOR_PICKER_THEME: LxTheme = {
  id: 'color-picker',
  name: '自定义',
  isDark: false,
  isCustom: true,
  colorPrimary: '#ff6699',
}

function toThemes(groupName: string, definitionStr: string): LxTheme[] {
  return definitionStr
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const [colorPrimary, name] = line.split(' ').filter(Boolean)
      return { id: `${groupName}:${name}`, name, colorPrimary }
    })
}

// https://www.bilibili.com/video/BV1g3411u7Lg/
const LongwashingGroupName = 'UP长期洗涤'
const LongwashingThemes = toThemes(
  LongwashingGroupName,
  `
  #0545b2 理想之蓝
  #f4cd00 柠檬黄
  #ef2729 石榴红
  #f89c00 鹿箭
  #233728 黛绿
  #f2b9b7 和熙粉
  #f3cc91 芝士黄
  #6b4c68 葡萄紫
  #ff7227 落日橙
  #004d62 碧海天
  #23909b 洗碧空
  #aeb400 芥丝绿
  #425a17 箬叶青

  #002fa7 克莱因蓝
  #003153 普鲁士蓝
  #01847f 马尔斯绿
  #fbd26a 申布伦黄
  #470024 勃艮第红
  #492d22 凡戴克棕
  `,
)

const BIBIBILI_EVOLVED_SYNC_ID = 'bilibili-evolved-sync'

export const ThemeGroups: {
  name: string
  tooltip?: ReactNode
  themes: LxTheme[]
}[] = [
  {
    name: '预设',
    themes: [
      DEFAULT_BILI_PINK_THEME,
      { id: 'bilibili-blue', name: 'B站蓝', colorPrimary: '#00aeec' },
      { id: 'app-custom-高能红', name: '高能红', colorPrimary: '#fd453e' },
      { id: 'app-custom-咸蛋黄', name: '咸蛋黄', colorPrimary: '#ffc034' },
      { id: 'app-custom-早苗绿', name: '早苗绿', colorPrimary: '#85c255' },
      { id: 'app-custom-宝石蓝', name: '宝石蓝', colorPrimary: '#0095ef' },
      { id: 'app-custom-罗兰紫', name: '罗兰紫', colorPrimary: '#a029ac' },
      {
        id: BIBIBILI_EVOLVED_SYNC_ID,
        name: 'B-Evolved',
        colorPrimary: 'var(--theme-color, #f69)',
        tooltip: (
          <>
            使用 Bilibili-Evolved 的主题色
            <br />在 Bilibili-Evolved 设置中修改主题色后可能需要刷新页面同步
          </>
        ),
      },
      COLOR_PICKER_THEME,
    ],
  },
  {
    name: 'LX Themes',
    themes: LX_THEMES,
    tooltip: (
      <>
        提取自{' '}
        <a target='_blank' href='https://github.com/lyswhut/lx-music-desktop/'>
          lx-music-desktop
        </a>
        <br />
        Apache License 2.0
      </>
    ),
  },
  {
    name: LongwashingGroupName,
    themes: LongwashingThemes,
    tooltip: (
      <>
        提取自{' '}
        <a target='_blank' href='https://www.bilibili.com/video/BV1g3411u7Lg/'>
          BV1g3411u7Lg
        </a>{' '}
        &{' '}
        <a target='_blank' href='https://www.bilibili.com/video/BV1xu411q7sU/'>
          BV1xu411q7sU
        </a>
      </>
    ),
  },
  {
    name: '紫定能行',
    themes: PURPLE_COLORS.map((color) => ({
      id: `purple-colors-${color.name}`,
      name: color.nameZh,
      colorPrimary: color.hex,
      tooltip: (
        <>
          {color.name} {color.nameZh} <br />
          {color.desc}
        </>
      ),
    })),
    tooltip: (
      <>
        提取自{' '}
        <a target='_blank' href='https://magicdawn.github.io/purple-colors/'>
          purple-colors
        </a>{' '}
      </>
    ),
  },
]

const ALL_THEMES = ThemeGroups.map((x) => x.themes).flat()

/**
 * use outside React
 */
export function getCurrentTheme() {
  const theme =
    ALL_THEMES.find((t) => t.id === (settings.theme || DEFAULT_BILI_PINK_THEME.id)) || DEFAULT_BILI_PINK_THEME
  if (theme.id === COLOR_PICKER_THEME.id && settings.colorPickerThemeSelectedColor) {
    theme.colorPrimary = settings.colorPickerThemeSelectedColor
  }
  return theme
}

/**
 * react hook
 */
export function useCurrentTheme() {
  let { theme: themeId, colorPickerThemeSelectedColor } = useSettingsSnapshot()
  themeId ||= DEFAULT_BILI_PINK_THEME.id
  return useMemo(() => {
    const theme = ALL_THEMES.find((t) => t.id === themeId) || DEFAULT_BILI_PINK_THEME
    if (theme.id === COLOR_PICKER_THEME.id && colorPickerThemeSelectedColor) {
      return { ...theme, colorPrimary: colorPickerThemeSelectedColor }
    }
    return theme
  }, [themeId, colorPickerThemeSelectedColor])
}

/**
 * colorPrimary hex 值, 需传入 antd
 */
export function useColorPrimaryHex() {
  const currentTheme = useCurrentTheme()
  const evolvedThemeColor = $evolvedThemeColor.use()

  let colorPrimary = currentTheme.colorPrimary
  if (currentTheme.id === BIBIBILI_EVOLVED_SYNC_ID) {
    colorPrimary = evolvedThemeColor || DEFAULT_BILI_PINK_THEME.colorPrimary
  }

  return colorPrimary
}
