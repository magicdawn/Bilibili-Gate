import { StyleProvider } from '@ant-design/cssinjs'
import createEmotion from '@emotion/css/create-instance'
import { CacheProvider } from '@emotion/react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { assert } from 'es-toolkit'
import { APP_CLS_ROOT } from '$common'
import { appUsingFont } from '$common/css-vars-export.module.scss'
import { AntdStaticFunctionsSetup } from '$modules/antd'
import { useIsDarkMode } from '$modules/dark-mode'
import { clsZAntdPopupBase, parseZ } from './fragments'
import { GlobalBaseStyle, GlobalStyle } from './GlobalStyle'
import { useColorPrimaryHex } from './ModalSettings/theme.shared'
import type { ReactNode } from 'react'

function compose(...fns: Array<((c: ReactNode) => ReactNode) | false>) {
  return function (c: ReactNode) {
    return fns.reduceRight((content, fn) => (fn ? fn(content) : content), c)
  }
}

export function AppRoot({
  children,
  injectGlobalStyle = false,
  antdSetup = false,
  cssInsertContainer,
  cssInsertContainerEmotionKey,
}: {
  children?: ReactNode
  injectGlobalStyle?: boolean
  antdSetup?: boolean
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
          },
        }}
      >
        {c}
      </ConfigProvider>
    ),
  )

  return wrap(
    <>
      {antdSetup && <AntdStaticFunctionsSetup />}
      <GlobalBaseStyle />
      {injectGlobalStyle && <GlobalStyle />}
      {children}
    </>,
  )
}
