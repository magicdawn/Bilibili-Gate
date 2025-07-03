import { useHover } from 'ahooks'
import { AnimatePresence, motion } from 'framer-motion'
import { unoMerge } from 'unocss-merge'
import { useUnoMerge } from 'unocss-merge/react'
import { setForwardedRef } from '$common/hooks/mixed-ref'
import { clsZLeftMarks, clsZRightActions } from '../index.shared'
import type { ComponentProps, ComponentRef, ReactNode } from 'react'

export type InlinePosition = 'left' | 'right'

const C = {
  top: (inlinePosition: InlinePosition) =>
    clsx(
      'absolute top-8px',
      inlinePosition === 'left' ? 'left-8px' : 'right-8px',
      inlinePosition === 'left' ? clsZLeftMarks : clsZRightActions,
    ),

  topContainer: (inlinePosition: InlinePosition) =>
    clsx(
      C.top(inlinePosition),
      'flex items-center gap-x-5px',
      inlinePosition === 'left' ? 'flex-row' : 'flex-row-reverse',
    ),

  tooltip: (inlinePosition: InlinePosition) =>
    clsx(
      'absolute bottom--6px pointer-events-none select-none translate-y-100% text-12px whitespace-nowrap rounded-4px line-height-18px py-4px px-8px text-white bg-gate-primary',
      inlinePosition === 'left' ? 'left--5px' : 'right--5px',
    ),
}

export { C as VideoCardActionsClassNames }

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
        return unoMerge(
          'action-button',
          'relative size-28px rounded-6px cursor-pointer bg-[rgb(33_33_33_/_0.7)] color-white',
          'b-1px b-solid',
          active ? 'b-gate-primary' : 'b-#444',
          'hover:b-gate-primary',
          useMotion ? 'inline-flex' : visible ? 'inline-flex' : 'hidden',
          'items-center justify-center',
          '[&_svg]:(select-none pointer-events-none)',
          className,
        )
      }, [active, className, visible, useMotion])

      const sharedProps = {
        ...divProps,
        className: _className,
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
  tooltipClassName,
}: {
  inlinePosition: InlinePosition
  tooltip: ReactNode
  tooltipClassName?: string
}) {
  const triggerRef = useRef<ComponentRef<'div'> | null>(null)
  const hovering = useHover(triggerRef)
  const tooltipEl = (
    <span
      style={{ display: hovering ? 'block' : 'none' }}
      className={useUnoMerge(C.tooltip(inlinePosition), tooltipClassName)}
    >
      {tooltip}
    </span>
  )
  return { triggerRef, tooltipEl }
}
