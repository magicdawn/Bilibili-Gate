/**
 * inspired by styles of
 * - https://ai.taobao.com
 * - https://xlog.app/hottest
 *
 * box-shadow playground
 * https://box-shadow.dev/
 */

import { css as _css, css } from '@emotion/react'
import { useSnapshot } from 'valtio'
import { APP_NAMESPACE } from '$common'
import { bgLv1Value, bgLv2Value, borderColorValue, primaryColorValue } from '$components/css-vars'
import { multiSelectStore } from '$modules/multi-select/store'
import { useSettingsSnapshot } from '$modules/settings'
import { tweakLightness } from '$utility/css'
import type { CssProp } from '$utility/type'
import { bgValue, videoCardBorderRadiusValue } from '../css-vars'
import { isDisplayAsList } from './index.shared'

const c = tweakLightness(primaryColorValue, 0.1)

const Styles = {
  normalBorder: css`
    border-color: ${borderColorValue};
  `,
  activeBorder: css`
    border-color: ${primaryColorValue};
    box-shadow: 0px 0px 9px 4px ${c};
  `,
  rounded: css`
    border-radius: ${videoCardBorderRadiusValue};
  `,
  bgLv1: css`
    background-color: ${bgLv1Value};
  `,
  // make cover zoom
  coverZoomEffect: css`
    .bili-video-card__cover {
      transform-origin: center center;
      transition: transform 0.2s ease-out;
      transform: scale(1.05);
    }
  `,
}

export const multiSelectedCss = css`
  ${Styles.activeBorder}
  &:hover {
    ${Styles.activeBorder}
  }
`

/**
 * for dislike & blacklist card
 * - show border ALWAYS
 * - hover highlight bg
 * - hover highlight separator
 */
export function useBlockedCardCss(isBlockedCard: boolean): CssProp {
  const sepIdentifier = `--${APP_NAMESPACE}-separator-color`
  return useMemo(() => {
    if (!isBlockedCard) return undefined
    return _css`
      ${Styles.rounded}
      ${Styles.normalBorder}

      background-color: ${bgValue};
      ${sepIdentifier}:  ${bgLv1Value};
      &:hover {
        background-color: ${bgLv1Value};
        ${sepIdentifier}: ${bgLv2Value};
      }

      /* disable padding */
      margin-inline: 0;
      .bili-video-card__wrap {
        padding: 0;
      }
    `
  }, [isBlockedCard])
}

export function useCardBorderCss(): CssProp {
  const {
    useDelayForHover,
    style: {
      videoCard: { useBorder, useBorderOnlyOnHover, useBoxShadow },
      pureRecommend: { cardDisplay },
    },
  } = useSettingsSnapshot()
  const { multiSelecting } = useSnapshot(multiSelectStore)

  return useMemo(() => {
    return [
      css`
        border: 1px solid transparent;
        transition-property: border-color, box-shadow, background-color;
        transition-duration: 0.3s;
        transition-timing-function: ease-in-out;
      `,

      (multiSelecting || (useBorder && !isDisplayAsList(cardDisplay))) && [
        css`
          cursor: pointer;
          ${Styles.rounded}
          &:hover {
            ${Styles.bgLv1}
            ${Styles.normalBorder}
            ${useBoxShadow && Styles.activeBorder}
            ${useDelayForHover && Styles.coverZoomEffect}
          }
        `,

        // show border not:hover
        (multiSelecting || !useBorderOnlyOnHover) && Styles.normalBorder,
      ],
    ]
  }, [useBorder, useBorderOnlyOnHover, useBoxShadow, useDelayForHover, cardDisplay, multiSelecting])
}

export function getActiveCardBorderCss(active: boolean): CssProp {
  return active && [Styles.rounded, Styles.activeBorder]
}
