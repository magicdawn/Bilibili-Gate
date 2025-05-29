import { css as _css, css, Global } from '@emotion/react'
import { APP_CLS_ROOT, IN_BILIBILI_HOMEPAGE } from '$common'
import { appBgId, appColorPrimaryId } from '$common/css-vars-export.module.scss'
import { useAntLinkColorGlobalStyle } from '$common/emotion-css'
import { $headerWidth, $usingEvolevdHeader, useBackToTopRight } from '$header'
import { useIsDarkMode } from '$modules/dark-mode'
import { useSettingsSnapshot } from '$modules/settings'
import { modalGlobalStyle } from './_base/BaseModal'
import { useColorPrimaryHex } from './ModalSettings/theme.shared'

export function GlobalStyle() {
  const colorPrimary = useColorPrimaryHex()
  const { pureRecommend, style } = useSettingsSnapshot()
  const dark = useIsDarkMode()
  const backToTopRight = useBackToTopRight()
  const usingEvolevdHeader = $usingEvolevdHeader.use()
  const antLinkColorGlobalStyle = useAntLinkColorGlobalStyle()

  // 会有多次变宽的效果, 看起来很诡异!!!
  // bilibili-default -> 90 % -> evolved宽度计算
  const width = $headerWidth.use() ?? 90
  const padding = '0 10px'

  return (
    <>
      <Global
        styles={[
          antLinkColorGlobalStyle,
          modalGlobalStyle,
          _css`
            :root {
              ${appColorPrimaryId}: ${colorPrimary};
              ${appBgId}: ${dark ? '#222' : style.pureRecommend.useWhiteBackground ? `var(--bg1, #fff)` : `var(--bg2, #F6F7F8)`};
            }
          `,
        ]}
      />

      {IN_BILIBILI_HOMEPAGE && pureRecommend && (
        <Global
          styles={[
            css`
              /* hide original main, in case not deleted */
              #i_cecream .bili-feed4-layout {
                display: none;
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

            style.pureRecommend.useCustomGrid &&
              css`
                /* enlarge container width */
                #i_cecream,
                .bili-feed4 .bili-header,
                .bili-feed4 .bili-header .bili-header__bar {
                  max-width: unset;
                }

                .bili-feed4-layout,
                .bili-feed4 .bili-header .bili-header__channel {
                  max-width: ${width}%;
                  /* 与 bilibili-evolve 视觉上对齐 */
                  padding: ${padding};
                }
              `,

            style.pureRecommend.useCustomGrid &&
              typeof backToTopRight === 'number' &&
              css`
                .${APP_CLS_ROOT} {
                  --back-top-right: ${backToTopRight}px;
                }
              `,

            /**
             * extra background-color work for `PureRecommend`
             */
            style.pureRecommend.useWhiteBackground
              ? css`
                  body {
                    /* same as #i_cecream */
                    background-color: var(--bg1);
                  }
                `
              : css`
                  body,
                  .large-header,
                  #i_cecream,
                  .bili-header .bili-header__channel {
                    background-color: var(--bg2);
                  }
                  .bili-header .bili-header__channel .channel-entry-more__link,
                  .bili-header .bili-header__channel .channel-link {
                    background-color: var(--bg1);
                  }
                `,

            style.pureRecommend.hideTopChannel &&
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
      )}
    </>
  )
}
