/**
 * https://keithjgrant.com/posts/2023/04/transitioning-to-height-auto/
 * https://www.youtube.com/watch?v=B_n4YONte5A
 * https://css-tricks.com/css-grid-can-do-auto-height-transitions/
 */

import { css } from '@emotion/react'
import type { CSSProperties, ReactNode } from 'react'

export function CollapsePanel({
  expanded,
  children,
  ...props
}: {
  children: ReactNode
  expanded: boolean
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      {...props}
      data-classname='wrapper'
      css={css`
        transition: grid-template-rows 0.2s ease-out;
        display: grid;
        grid-template-rows: ${expanded ? 1 : 0}fr;
      `}
    >
      <div data-classname='inner' className='overflow-hidden'>
        {children}
      </div>
    </div>
  )
}
