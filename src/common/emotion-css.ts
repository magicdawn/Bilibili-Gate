import { css } from '@emotion/react'
import { theme } from 'antd'
import { useMemo } from 'react'
import { useSnapshot } from 'valtio'
import { APP_NAMESPACE } from '$common'
import { appBorderColorValue } from '$components/css-vars'
import { settings } from '$modules/settings'

// harmonyos_regular 没法对齐
const antdBtnTextStyle = css`
  display: inline-block;

  /* 不同 zoom 表现不同 */
  /* margin-top: 1px; */

  /* 使用 line-height 在不同 zoom 下表现更好 */
  line-height: var(--ant-control-height);
`

// https://github.com/magicdawn/magicdawn/issues/136#issuecomment-2170532246
export const inlineContentHeightResetCss = css`
  line-height: 1;
  > * {
    vertical-align: top;
  }
`

// some panel trigger by this button is Open, add style to this trigger button
// copy from button:hover
export const buttonOpenCss = css`
  color: var(--ant-button-default-hover-color);
  border-color: var(--ant-button-default-hover-border-color);
  background: var(--ant-button-default-hover-bg);
`
export function useButtonOpenColor() {
  return theme.useToken().token.colorPrimaryHover
}
export function usePopoverBorderColor() {
  const { popoverBorderColorUseColorPrimary } = useSnapshot(settings.style.general)
  const buttonOpenColor = useButtonOpenColor()
  return popoverBorderColorUseColorPrimary ? buttonOpenColor : appBorderColorValue
}

export function useAntLinkCss() {
  const { colorLink, colorLinkActive, colorLinkHover } = theme.useToken().token
  return useMemo(
    () => css`
      color: ${colorLink};
      &:visited {
        color: ${colorLink};
      }
      &:hover {
        color: ${colorLinkHover};
      }
      &:active {
        color: ${colorLinkActive};
      }
    `,
    [colorLink, colorLinkActive, colorLinkHover],
  )
}

export const APP_CLS_USE_ANT_LINK_COLOR = `${APP_NAMESPACE}--use-ant-link-color`
export function useAntLinkColorGlobalStyle() {
  const s = useAntLinkCss()
  return css`
    :root .${APP_CLS_USE_ANT_LINK_COLOR} {
      ${s}
    }
  `
}
