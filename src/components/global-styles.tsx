import { css as _css, css, Global } from '@emotion/react'
import { useMemo } from 'react'
import { APP_CLS_ROOT, IN_BILIBILI_HOMEPAGE } from '$common'
import { appBgId, appPrimaryColorId, appTextColorId } from '$common/css-vars-export.module.scss'
import { useAntLinkColorGlobalStyle } from '$common/emotion-css'
import { $headerWidth, $usingEvolevdHeader, useBackToTopRight } from '$header'
import { useIsDarkMode } from '$modules/dark-mode'
import { useSettingsSnapshot } from '$modules/settings'
import { modalGlobalStyle } from './_base/BaseModal'
import { appBgValue } from './css-vars'
import { useColorPrimaryHex } from './ModalSettings/theme.shared'

export function getBgSrcVaribale(dark: boolean, useWhiteBackground: boolean) {
  return dark ? '--bg1' : useWhiteBackground ? '--bg1' : '--bg2'
}

/**
 * BaseGlobalStyle: [define-color-primary, bg, text, link]
 * HomePageGlobalStyle: setup for overwrite homepage
 */

export function BaseGlobalStyle() {
  const colorPrimary = useColorPrimaryHex()
  const dark = useIsDarkMode()
  const antLinkColorGlobalStyle = useAntLinkColorGlobalStyle()
  const {
    style: {
      pureRecommend: { useWhiteBackground },
    },
  } = useSettingsSnapshot()

  const config = useMemo(() => {
    return {
      bgSrc: getBgSrcVaribale(dark, useWhiteBackground),
      bgFallback: dark ? '#222' : useWhiteBackground ? '#fff' : '#f6f7f8',
      text: dark ? '#fff' : '#333',
    }
  }, [dark, useWhiteBackground])

  return (
    <Global
      styles={[
        antLinkColorGlobalStyle,
        modalGlobalStyle,
        _css`
            :root {
              ${appPrimaryColorId}: ${colorPrimary};
              ${appBgId}: var(${config.bgSrc}, ${config.bgFallback});
              ${appTextColorId}: var(--text1, ${config.text});
            }
          `,
      ]}
    />
  )
}

export function HomePageGlobalStyle() {
  const {
    grid: { useCustomGrid },
    style: {
      pureRecommend: { useWhiteBackground, hideTopChannel },
    },
  } = useSettingsSnapshot()
  const dark = useIsDarkMode()
  const backToTopRight = useBackToTopRight()
  const usingEvolevdHeader = $usingEvolevdHeader.use()

  // 会有多次变宽的效果, 看起来很诡异!!!
  // bilibili-default -> 90 % -> evolved宽度计算
  const width = $headerWidth.use() ?? 90
  const padding = '0 10px'

  if (!IN_BILIBILI_HOMEPAGE) return
  return (
    <Global
      styles={[
        css`
          /* hide original main, in case not deleted */
          /* #app 太通用了, 加上 body > 防止误伤 */
          #i_cecream,
          body > #app {
            .bili-feed4-layout {
              display: none;
            }
          }

          /* download tip */
          /* 立即登录免费领大会员优惠券 */
          /* 广告 */
          .desktop-download-tip,
          .vip-login-tip,
          .palette-button-adcard {
            display: none !important;
          }
        `,

        useCustomGrid &&
          css`
            /* enlarge container width */
            #i_cecream,
            body > #app,
            .bili-feed4 .bili-header,
            .bili-feed4 .bili-header .bili-header__bar {
              max-width: unset;
            }

            .bili-feed4-layout,
            .bili-feed4 .bili-header .bili-header__channel {
              max-width: ${width}%;
              padding: ${padding}; // bilibili-evolve custom-header 视觉上对齐
            }
          `,

        useCustomGrid &&
          typeof backToTopRight === 'number' &&
          css`
            .${APP_CLS_ROOT} {
              --back-top-right: ${backToTopRight}px;
            }
          `,

        /**
         * extra background-color work for `PureRecommend`
         */
        css`
          body {
            // NOTE: #app 版本 body 上有 inline style 'var(--bg3)', 而且屏幕特别宽的时候有 bug (边上是灰的)
            background-color: ${appBgValue} !important;
          }
        `,
        useWhiteBackground
          ? undefined
          : css`
              .large-header,
              #i_cecream,
              body > #app,
              .bili-header.large-header,
              .bili-header .bili-header__channel {
                background-color: var(--bg2);
              }
              .bili-header .bili-header__channel .channel-entry-more__link,
              .bili-header .bili-header__channel .channel-link {
                background-color: var(--bg1);
              }
            `,

        hideTopChannel &&
          css`
            .bili-header__channel,
            .bili-header__banner {
              display: none !important;
            }

            ${!usingEvolevdHeader &&
            css`
              .bili-feed4 .bili-header {
                min-height: 64px !important;
              }
            `}

            .bili-feed4 .bili-header .bili-header__bar {
              &.slide-down,
              &:not(.slide-down) {
                animation: headerSlideDown 0.3s linear forwards !important;
                box-shadow: 0 2px 4px ${dark ? 'rgb(255 255 255 / 5%)' : 'rgb(0 0 0 / 8%)'} !important;
              }
            }

            .bili-header__bar:not(.slide-down) {
              background-color: var(--bg1);
              color: var(--text1);
              transition: background-color 0.2s linear;
              animation-name: headerSlideDown;

              .left-entry {
                .mini-header__title,
                .entry-title,
                .default-entry,
                .loc-mc-box__text,
                .download-entry,
                .loc-entry {
                  color: var(--text1);
                }
              }
              .right-entry .right-entry__outside {
                .right-entry-text,
                .right-entry-icon {
                  color: var(--text2);
                }
              }
            }

            .area-header-wrapper {
              margin-top: 10px;
            }
          `,
      ]}
    />
  )
}
