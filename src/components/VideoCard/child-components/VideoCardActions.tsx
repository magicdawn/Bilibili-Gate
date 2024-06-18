import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { css as _css, css } from '@emotion/react'
import { useHover } from 'ahooks'
import { type ComponentProps, type ReactNode } from 'react'

const baseZ = 3

export type InlinePosition = 'left' | 'right'

const S = {
  top: (inlinePosition: InlinePosition) => css`
    position: absolute;
    top: 8px;
    ${inlinePosition}: 8px;
    transform: translateZ(0);
    z-index: ${baseZ + 2};
  `,

  topContainer: (inlinePosition: InlinePosition) => [
    S.top(inlinePosition),
    css`
      display: flex;
      flex-direction: ${inlinePosition === 'left' ? 'row' : 'row-reverse'};
      column-gap: 5px;
    `,
  ],

  button: (visible: boolean) => css`
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    cursor: pointer;
    background-color: rgba(33, 33, 33, 0.7);
    border: 1px solid #444;
    color: #fff;
    &:hover {
      border-color: ${colorPrimaryValue};
      /* 看不清, 就用 #fff 即可 */
      /* color: ${colorPrimaryValue}; */
    }

    display: ${visible ? 'inline-flex' : 'none'};
    align-items: center;
    justify-content: center;

    /* svg-icon */
    svg {
      pointer-events: none;
      user-select: none;
    }
  `,

  tooltip: (inlinePosition: InlinePosition, tooltipOffset = 5) => [
    css`
      position: absolute;
      bottom: -6px;
      pointer-events: none;
      user-select: none;
      transform: translateY(100%);
      font-size: 12px;
      white-space: nowrap;
      border-radius: 4px;
      line-height: 18px;
      padding: 4px 8px;
      color: #fff;
      background-color: rgba(0, 0, 0, 0.8);
      background-color: ${colorPrimaryValue};
    `,
    _css`
      ${inlinePosition}: -${tooltipOffset}px;
    `,
  ],
}
export const VideoCardActionStyle = S

export const VideoCardActionButton = memo(function VideoCardActionButton({
  inlinePosition,
  icon,
  tooltip,
  visible,
  className,
  ...divProps
}: {
  inlinePosition: InlinePosition
  icon: ReactNode
  tooltip: string
  visible?: boolean
} & ComponentProps<'div'>) {
  visible ??= true
  const { triggerRef, tooltipEl } = useTooltip({ inlinePosition, tooltip })
  return (
    <div
      {...divProps}
      ref={triggerRef}
      css={[S.button(visible)]}
      className={clsx('action-button', className)}
    >
      {icon}
      {tooltipEl}
    </div>
  )
})

export function useTooltip({
  inlinePosition,
  tooltip,
  tooltipOffset,
}: {
  inlinePosition: InlinePosition
  tooltip: ReactNode
  tooltipOffset?: number
}) {
  const triggerRef = useRef(null)
  const hovering = useHover(triggerRef)
  const tooltipEl = (
    <span
      style={{ display: hovering ? 'block' : 'none' }}
      css={S.tooltip(inlinePosition, tooltipOffset)}
    >
      {tooltip}
    </span>
  )
  return { triggerRef, tooltipEl }
}
