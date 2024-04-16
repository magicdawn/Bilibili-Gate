import { APP_NAME } from '$common'
import { $evoledThemeColor } from '$header'
import { settings, useSettingsSnapshot } from '$modules/settings'
import LX_THEMES from './lx-themes.json'

export const colorPrimaryIdentifier = `--${APP_NAME}-color-primary`
export const colorPrimaryValue = `var(${colorPrimaryIdentifier})`

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
      return { id: groupName + ':' + name, name, colorPrimary }
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

  #002FA7 克莱因蓝
  #003153 普鲁士蓝
  #01847F 马尔斯绿
  #FBD26A 申布伦黄
  #470024 勃艮第红
  #492D22 凡戴克棕
  `,
)

export const BIBIBILI_EVOLVED_SYNC_ID = 'bilibili-evolved-sync'

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
      { id: 'app-靓紫', name: '靓紫', colorPrimary: '#8500ff' },
      {
        id: BIBIBILI_EVOLVED_SYNC_ID,
        name: 'B-Evolved',
        colorPrimary: 'var(--theme-color, #f69)',
        tooltip: (
          <>
            使用 Bilibili-Evolved 的主题色
            <br />在 Bilibili-Evolved 修改主题色后需刷新页面同步
          </>
        ),
      },
      COLOR_PICKER_THEME,
    ],
  },
  {
    name: '移动端',
    themes: [
      { id: 'app-custom-高能红', name: '高能红', colorPrimary: '#fd453e' },
      { id: 'app-custom-咸蛋黄', name: '咸蛋黄', colorPrimary: '#ffc034' },
      { id: 'app-custom-早苗绿', name: '早苗绿', colorPrimary: '#85c255' },
      { id: 'app-custom-宝石蓝', name: '宝石蓝', colorPrimary: '#0095ef' },
      { id: 'app-custom-罗兰紫', name: '罗兰紫', colorPrimary: '#a029ac' },
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
]

const ALL_THEMES = ThemeGroups.map((x) => x.themes).flat()

/**
 * use outside React
 */

export function getCurrentTheme() {
  const theme =
    ALL_THEMES.find((t) => t.id === (settings.theme || DEFAULT_BILI_PINK_THEME.id)) ||
    DEFAULT_BILI_PINK_THEME
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
      theme.colorPrimary = colorPickerThemeSelectedColor
    }
    return theme
  }, [themeId, colorPickerThemeSelectedColor])
}

/**
 * colorPrimary hex 值, 需传入 antd
 */

export function useColorPrimaryHex() {
  const currentTheme = useCurrentTheme()
  const evoledThemeColor = $evoledThemeColor.use()

  let colorPrimary = currentTheme.colorPrimary
  if (currentTheme.id === BIBIBILI_EVOLVED_SYNC_ID) {
    colorPrimary = evoledThemeColor || DEFAULT_BILI_PINK_THEME.colorPrimary
  }

  return colorPrimary
}
