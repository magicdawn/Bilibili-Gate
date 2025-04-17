import { appUsingFont, zIndexAntdPopupBase } from '$common/css-vars-export.module.scss'
import { AntdStaticFunctionsSetup } from '$modules/antd'
import { useIsDarkMode } from '$modules/dark-mode'
import { StyleProvider, type StyleProviderProps } from '@ant-design/cssinjs'
import { cache as emotionCssDefaultCache } from '@emotion/css'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import type { ReactNode } from 'react'
import { GlobalStyle } from './GlobalStyle'
import { useColorPrimaryHex } from './ModalSettings/theme.shared'

// https://github.com/emotion-js/emotion/issues/1105
emotionCssDefaultCache.compat = true

function compose(...fns: Array<(c: ReactNode) => ReactNode>) {
  return function (c: ReactNode) {
    return fns.reduceRight((content, fn) => fn(content), c)
  }
}

export function AppRoot({
  children,
  injectGlobalStyle = false,
  antdSetup = false,
  emotionCache = emotionCssDefaultCache,
  styleProviderProps,
}: {
  children: ReactNode
  injectGlobalStyle?: boolean
  antdSetup?: boolean
  emotionCache?: EmotionCache
  styleProviderProps?: StyleProviderProps
}) {
  const dark = useIsDarkMode()
  const colorPrimary = useColorPrimaryHex()

  const wrap = compose(
    // emotion cache
    (c) => <CacheProvider value={emotionCache}>{c}</CacheProvider>,

    // antd style
    (c) => <StyleProvider {...styleProviderProps}>{c}</StyleProvider>,

    // antd config
    (c) => (
      <ConfigProvider
        locale={zhCN}
        button={{ autoInsertSpace: false }}
        theme={{
          cssVar: true,
          algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary,
            colorBgSpotlight: colorPrimary, // tooltip bg
            zIndexPopupBase: Number(zIndexAntdPopupBase),
            fontFamily: appUsingFont,
          },
          components: {
            Notification: {
              zIndexPopup: Number(zIndexAntdPopupBase),
            },
            // 也很难看~
            // Segmented: {
            //   trackPadding: 4,
            //   itemSelectedBg: colorPrimary,
            //   itemActiveBg: colorPrimary,
            //   trackBg: tweakLightness(colorPrimary, -0.2),
            //   itemSelectedColor: '#fff',
            //   itemColor: '#fff',
            //   itemHoverColor: '#fff',
            // },
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
      {injectGlobalStyle && <GlobalStyle />}
      {children}
    </>,
  )
}
