import { StyleProvider } from '@ant-design/cssinjs'
import createEmotion from '@emotion/css/create-instance'
import { CacheProvider } from '@emotion/react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { assert } from 'es-toolkit'
import { useMemo, type ReactNode } from 'react'
import { APP_CLS_ROOT } from '$common'
import { appUsingFont } from '$common/css-vars-export.module.scss'
import { AntdStaticFunctionsSetup } from '$modules/antd'
import { useIsDarkMode } from '$modules/dark-mode'
import { clsZAntdPopupBase, parseZ } from './fragments'
import { BaseGlobalStyle, HomePageGlobalStyle } from './global-styles'
import { useColorPrimaryHex } from './ModalSettings/theme.shared'

function compose(...fns: Array<((c: ReactNode) => ReactNode) | false>) {
  return function (c: ReactNode) {
    return fns.reduceRight((content, fn) => (fn ? fn(content) : content), c)
  }
}

export function AppRoot({
  children,
  cssInsertContainer,
  cssInsertContainerEmotionKey,
}: {
  children?: ReactNode
  cssInsertContainer?: Element | ShadowRoot
  cssInsertContainerEmotionKey?: string
}) {
  if (cssInsertContainer) {
    assert(cssInsertContainerEmotionKey, 'cssInsertContainerEmotionKey is required when cssInsertContainer is provided')
  }

  const emotionCache = useMemo(() => {
    if (cssInsertContainer) {
      return createEmotion({
        key: cssInsertContainerEmotionKey!,
        container: cssInsertContainer,
      }).cache
    }
  }, [cssInsertContainer, cssInsertContainerEmotionKey])

  const dark = useIsDarkMode()
  const colorPrimary = useColorPrimaryHex()

  // antd Popover 边界不清, dark-mode bg: #17181a
  // antd 默认 bgColorBase: #000, popover bg 为 colorBgElavated, 与 body-bg #17181a 近似, 导致看不清
  //  - 将 #17181a 作为 colorBgBase 会导致所有 bg 偏亮 `AppColors.darkBg`
  //  - 故使用 #000 的手动偏移值 `#0b0b0b`
  const colorBgBaseAsHex: string | undefined = useMemo(() => (dark ? '#0c0c0c' : undefined), [dark])

  const wrap = compose(
    // emotion cache
    !!emotionCache && ((c) => <CacheProvider value={emotionCache}>{c}</CacheProvider>),

    // antd style
    !!cssInsertContainer && ((c) => <StyleProvider container={cssInsertContainer}>{c}</StyleProvider>),

    // antd config
    (c) => (
      <ConfigProvider
        locale={zhCN}
        button={{ autoInsertSpace: false }}
        getPopupContainer={(triggerNode) => triggerNode?.closest<HTMLDivElement>('.' + APP_CLS_ROOT) ?? document.body}
        theme={{
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorBgBase: colorBgBaseAsHex,
            colorPrimary,
            colorBgSpotlight: colorPrimary, // tooltip bg
            zIndexPopupBase: parseZ(clsZAntdPopupBase),
            fontFamily: appUsingFont,
          },
          components: {
            Notification: {
              zIndexPopup: parseZ(clsZAntdPopupBase),
            },
            Button: {
              // the `default` / `primary` shadow is ugly, `danger` shadow 看不出来
              defaultShadow: 'none',
              primaryShadow: 'none',
            },
            Dropdown: {
              // paddingBlock: 3, // default 5 (px)
            },
          },
        }}
      >
        {c}
      </ConfigProvider>
    ),
  )
  return wrap(children)
}

/**
 * this component create SideEffects
 */
export function SetupForPage({
  antd,
  baseGlobalStyle,
  homePageGlobalStyle,
}: {
  antd?: boolean
  baseGlobalStyle?: boolean
  homePageGlobalStyle?: boolean
}) {
  return (
    <>
      {antd && <AntdStaticFunctionsSetup />}
      {baseGlobalStyle && <BaseGlobalStyle />}
      {homePageGlobalStyle && <HomePageGlobalStyle />}
    </>
  )
}
