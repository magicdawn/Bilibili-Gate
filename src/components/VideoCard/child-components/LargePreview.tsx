import { APP_CLS_CARD, appLog } from '$common'
import { colorPrimaryValue } from '$components/css-vars'
import { css } from '@emotion/react'
import { useEventListener } from 'ahooks'
import { orderBy, throttle } from 'es-toolkit'
import { motion } from 'framer-motion'
import type { ComponentRef, ReactNode } from 'react'

type Direction = 'top' | 'right' | 'bottom' | 'left'
type Bbox = { x: number; y: number; width: number; height: number }

export enum AspectRatioPreset {
  Horizontal = 16 / 9,
  Vertical = 9 / 16,
  Square = 1,
}

const reverseDirection = (direction: Direction) => {
  switch (direction) {
    case 'top':
      return 'bottom'
    case 'right':
      return 'left'
    case 'bottom':
      return 'top'
    case 'left':
      return 'right'
  }
}

const VisualPadding = 20

export const LargePreview = forwardRef<
  ComponentRef<'div'>,
  { children?: ReactNode; aspectRatio?: number }
>(({ children, aspectRatio = AspectRatioPreset.Horizontal }, forwardedRef) => {
  const ref = useRef<ComponentRef<'div'>>(null)

  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<
    | {
        direction: Direction
        elWidth: number
        elHeight: number
        elPosX: number
        elPosY: number
      }
    | undefined
  >(undefined)

  const hide = useMemoizedFn(() => {
    setVisible(false)
    setPosition(undefined)
  })

  const calculatePostion = useMemoizedFn(() => {
    const card = ref.current?.closest('.' + APP_CLS_CARD)
    if (!card) return hide()

    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const cardRect = card.getBoundingClientRect()

    // invisible
    if (
      cardRect.top > viewportHeight ||
      cardRect.bottom < 0 ||
      cardRect.left > viewportWidth ||
      cardRect.right < 0
    ) {
      return hide()
    }

    const possibleBoundingBox: Record<Direction, Bbox> = {
      top: { x: 0, y: 0, width: viewportWidth, height: cardRect.top },
      bottom: {
        x: 0,
        y: cardRect.bottom,
        width: viewportWidth,
        height: viewportHeight - cardRect.bottom,
      },
      left: { x: 0, y: 0, width: cardRect.left, height: viewportHeight },
      right: {
        x: cardRect.right,
        y: 0,
        width: viewportWidth - cardRect.right,
        height: viewportHeight,
      },
    }

    const getScaleInBox = (bbox: Bbox) => {
      const w = aspectRatio
      const h = 1

      const scaleX = bbox.width / w
      const scaleY = bbox.height / h

      const scale = Math.min(scaleX, scaleY)
      return { scale, scaleLimit: scaleX > scaleY ? ('height' as const) : ('width' as const) }
    }

    const picked = orderBy(
      Object.entries(possibleBoundingBox).map(([direction, bbox]) => ({
        direction: direction as Direction,
        bbox,
        ...getScaleInBox(bbox),
      })),
      [
        'scale',
        (x) => {
          // rest space
          switch (x.direction) {
            case 'top':
              return cardRect.top
            case 'bottom':
              return viewportHeight - cardRect.bottom
            case 'left':
              return cardRect.left
            case 'right':
              return viewportWidth - cardRect.right
          }
        },
      ],
      ['desc', 'desc'],
    )[0]

    const { direction, bbox, scale, scaleLimit } = picked
    appLog('picked', picked)

    let elWidth: number
    let elHeight: number
    if (scaleLimit === 'width') {
      elWidth = Math.floor(bbox.width - VisualPadding * 2)
      elHeight = Math.floor(elWidth / aspectRatio)
    } else if (scaleLimit === 'height') {
      elHeight = Math.floor(bbox.height - VisualPadding * 2)
      elWidth = Math.floor(elHeight * aspectRatio)
    } else {
      throw new Error('unexpected scaleLimit')
    }

    let elPosX = 0
    let elPosY = 0

    const fixX = () => {
      if (elPosX < VisualPadding) {
        elPosX = VisualPadding
        return
      }
      if (elPosX + elWidth > viewportWidth - VisualPadding) {
        elPosX = viewportWidth - VisualPadding - elWidth
        return
      }
    }
    const fixY = () => {
      if (elPosY < VisualPadding) {
        elPosY = VisualPadding
        return
      }
      if (elPosY + elHeight > viewportHeight - VisualPadding) {
        elPosY = viewportHeight - VisualPadding - elHeight
        return
      }
    }

    switch (direction) {
      case 'top':
        elPosX = cardRect.x + cardRect.width / 2 - elWidth / 2
        elPosY = cardRect.top - VisualPadding - elHeight
        fixX()
        break
      case 'bottom':
        elPosX = cardRect.x + cardRect.width / 2 - elWidth / 2
        elPosY = cardRect.bottom + VisualPadding
        fixX()
        break
      case 'right':
        elPosX = cardRect.right + VisualPadding
        elPosY = cardRect.y + cardRect.height / 2 - elHeight / 2
        fixY()
        break
      case 'left':
        elPosX = cardRect.left - VisualPadding - elWidth
        elPosY = cardRect.y + cardRect.height / 2 - elHeight / 2
        fixY()
        break
    }

    elPosX = Math.floor(elPosX)
    elPosY = Math.floor(elPosY)
    setVisible(true)
    setPosition({ direction, elWidth, elHeight, elPosX, elPosY })
  })

  const calculatePostionThrottled = useMemo(
    () => throttle(calculatePostion, 100),
    [calculatePostion],
  )

  useMount(() => {
    if (forwardedRef) {
      typeof forwardedRef === 'function'
        ? forwardedRef(ref.current)
        : (forwardedRef.current = ref.current)
    }
    calculatePostion()
  })

  useEventListener('resize', calculatePostionThrottled, { target: window })
  useEventListener('scroll', calculatePostionThrottled, { target: window })

  let initial: Partial<{ x: number; y: number }> = {}
  const direction = position?.direction
  const animateDistance = 40
  switch (direction) {
    case 'right':
      initial = { x: -animateDistance, y: 0 }
      break
    case 'left':
      initial = { x: animateDistance, y: 0 }
      break
    case 'top':
      initial = { x: 0, y: animateDistance }
      break
    case 'bottom':
      initial = { x: 0, y: -animateDistance }
      break
    default:
      break
  }

  return (
    <div
      ref={ref}
      css={[
        css`
          display: ${visible ? 'block' : 'none'};
        `,
        position &&
          css`
            position: fixed;
            z-index: 90000;
            width: ${position.elWidth}px;
            height: ${position.elHeight}px;
            top: ${position.elPosY}px;
            left: ${position.elPosX}px;
          `,
      ]}
    >
      {visible && (
        <motion.div
          initial={{ opacity: 0, ...initial }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ bounce: false }}
          css={css`
            background-color: rgba(255 255 255 / 0.5);
            backdrop-filter: blur(10px);
            border: 1px solid ${colorPrimaryValue};
            border-radius: 20px;
            height: 100%;
            overflow: hidden;
          `}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
})
