import { useHover } from 'ahooks'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef, memo, useMemo, useRef, type ComponentProps, type ComponentRef, type ReactNode } from 'react'
import { unoMerge } from 'unocss-merge'
import { useUnoMerge } from 'unocss-merge/react'
import { setForwardedRef } from '$common/hooks/mixed-ref'
import { clsZLeftMarks, clsZRightActions } from '../index.shared'

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
      'pointer-events-none absolute bottom--6px translate-y-100% select-none whitespace-nowrap rounded-4px bg-gate-primary px-8px py-4px text-12px text-white line-height-18px',
      inlinePosition === 'left' ? 'left-0' : 'right-0',
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
          'relative size-28px cursor-pointer rounded-6px bg-[rgb(33_33_33_/_0.7)] color-white',
          'b-1px b-solid',
          active ? 'b-gate-primary' : 'b-#444',
          'hover:b-gate-primary',
          useMotion ? 'inline-flex' : visible ? 'inline-flex' : 'hidden',
          'items-center justify-center',
          '[&_svg]:(pointer-events-none select-none)',
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
  const _className = useUnoMerge(C.tooltip(inlinePosition), tooltipClassName, hovering ? 'block' : 'hidden')
  const tooltipEl = tooltip ? <span className={_className}>{tooltip}</span> : undefined
  return { triggerRef, tooltipEl }
}
