import { css } from '@emotion/react'
import { Divider } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { appPrimaryColorValue } from '$components/css-vars'
import { tweakColorWithOklch } from '$utility/css'
import type { DividerProps } from 'antd/lib'

export function TooltipContentDivider({ className, ...restProps }: DividerProps) {
  return (
    <Divider
      variant='solid'
      {...restProps}
      className={useUnoMerge('my-7px', className)}
      css={css`
        border-top-color: ${tweakColorWithOklch(appPrimaryColorValue, { l: 0.9 })};
      `}
    />
  )
}
