import { motion } from 'framer-motion'

/**
 * svg checked mark
 *
 * 自己画的
 * viewBox = '0 0 200 200'
 * checkMarkD = 'M25,100 l48,48 a 8.5,8.5 0 0 0 10,0 l90,-90'
 *
 * 其他来源
 * 24 24 from iconify
 * https://icones.js.org/collection/line-md?icon=line-md:confirm
 */

export function IconAnimatedChecked({
  size = 18,
  useAnimation = false,
  color = 'currentColor',
  ...restProps
}: {
  size?: number
  useAnimation?: boolean
  color?: string
} & ComponentProps<'svg'>) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width={size} height={size} {...restProps}>
      <motion.path
        fill='transparent'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M5 11L11 17L21 7'
        {...(useAnimation
          ? {
              initial: { pathLength: 0 },
              animate: { pathLength: 1 },
              transition: { duration: 0.2, ease: 'easeInOut' },
            }
          : undefined)}
      />
    </svg>
  )
}
