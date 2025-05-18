import { css as _css, css } from '@emotion/react'
import { useHover } from 'ahooks'
import { AnimatePresence, motion } from 'framer-motion'
import { setForwardedRef } from '$common/hooks/mixed-ref'
import { colorPrimaryValue } from '$components/css-vars'
import { zIndexLeftMarks, zIndexRightActions } from '../index.shared'
import type { ComponentProps, ComponentRef, ReactNode } from 'react'

export type InlinePosition = 'left' | 'right'

const getZIndex = (inlinePosition: InlinePosition) => {
  return {
    left: zIndexLeftMarks,
    right: zIndexRightActions,
  }[inlinePosition]
}

const S = {
  top: (inlinePosition: InlinePosition) => css`
    position: absolute;
    top: 8px;
    ${inlinePosition}: 8px;
    /* transform: translateZ(0); */
    z-index: ${getZIndex(inlinePosition)};
  `,

  topContainer: (inlinePosition: InlinePosition) => [
    S.top(inlinePosition),
    css`
      display: flex;
      align-items: center;
      flex-direction: ${inlinePosition === 'left' ? 'row' : 'row-reverse'};
      column-gap: 5px;
    `,
  ],

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

export { S as VideoCardActionStyle }

const buttonInnerSvgCss = css`
  /* svg-icon */
  svg {
    pointer-events: none;
    user-select: none;
  }
`

// div / motion.div props 不兼容的 key
type InCompatibleDivProps = 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
type VideoCardActionButtonProps = {
  inlinePosition: InlinePosition
  icon: ReactNode
  tooltip: string
  visible?: boolean
  active?: boolean
  useMotion?: boolean
  motionProps?: ComponentProps<typeof motion.div>
} & Omit<ComponentProps<'div'>, InCompatibleDivProps>

export const VideoCardActionButton = memo(
  forwardRef<ComponentRef<'div'>, VideoCardActionButtonProps>(
    (
      {
        inlinePosition,
        icon,
        tooltip,
        visible = true,
        active = false,
        className,
        useMotion = false,
        motionProps,
        ...divProps
      },
      forwardedRef,
    ) => {
      const { triggerRef, tooltipEl } = useTooltip({ inlinePosition, tooltip })

      const _className = useMemo(() => {
        return clsx(
          'action-button',
          'relative size-28px rounded-6px cursor-pointer bg-[rgb(33_33_33_/_0.7)] color-white',
          'b-1px b-solid',
          active ? 'b-gate-primary' : 'b-#444',
          'hover:b-gate-primary',
          useMotion ? 'inline-flex' : visible ? 'inline-flex' : 'hidden',
          'items-center justify-center',
          className,
        )
      }, [active, className, visible, useMotion])

      const sharedProps = {
        ...divProps,
        className: _className,
        css: buttonInnerSvgCss,
        ref: (el: HTMLDivElement) => {
          triggerRef.current = el
          setForwardedRef(forwardedRef, el)
        },
        children: (
          <>
            {icon}
            {tooltipEl}
          </>
        ),
      }

      if (!useMotion) {
        return <div {...sharedProps} />
      } else {
        return (
          <AnimatePresence>
            {visible && <motion.div key={'action-button'} {...sharedProps} {...motionProps} />}
          </AnimatePresence>
        )
      }
    },
  ),
)

export function useTooltip({
  inlinePosition,
  tooltip,
  tooltipOffset,
}: {
  inlinePosition: InlinePosition
  tooltip: ReactNode
  tooltipOffset?: number
}) {
  const triggerRef = useRef<ComponentRef<'div'> | null>(null)
  const hovering = useHover(triggerRef)
  const tooltipEl = (
    <span style={{ display: hovering ? 'block' : 'none' }} css={S.tooltip(inlinePosition, tooltipOffset)}>
      {tooltip}
    </span>
  )
  return { triggerRef, tooltipEl }
}
