import { APP_CLS_CARD, baseDebug } from '$common'
import { zIndexVideoCardLargePreview } from '$common/css-vars-export.module.scss'
import { colorPrimaryValue } from '$components/css-vars'
import { isSafari } from '$ua'
import { css } from '@emotion/react'
import { useEventListener } from 'ahooks'
import { orderBy, throttle } from 'es-toolkit'
import { motion } from 'framer-motion'
import type { ComponentRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

const debug = baseDebug.extend('VideoCard:LargePreview')

export enum AspectRatioPreset {
  Horizontal = 16 / 9,
  Vertical = 9 / 16,
  Square = 1,
}

type Direction = 'top' | 'right' | 'bottom' | 'left'
type Bbox = { x: number; y: number; width: number; height: number }

const DirectionConfig: Record<
  Direction,
  { multiplier: 1 | -1; axis: 'x' | 'y'; reverse: Direction }
> = {
  right: { multiplier: 1, axis: 'x', reverse: 'left' },
  left: { multiplier: -1, axis: 'x', reverse: 'right' },
  bottom: { multiplier: 1, axis: 'y', reverse: 'top' },
  top: { multiplier: -1, axis: 'y', reverse: 'bottom' },
}

const VisualPadding = {
  border: 40,
  card: 15,
  total: 55,
}

export const LargePreview = forwardRef<
  ComponentRef<'div'>,
  { children?: ReactNode; aspectRatio?: number } & ComponentProps<'div'>
>(({ children, aspectRatio = AspectRatioPreset.Horizontal, ...restProps }, forwardedRef) => {
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

    debug('picked direction', picked)
    const { direction, bbox, scale, scaleLimit } = picked

    let elWidth: number
    let elHeight: number
    if (scaleLimit === 'width') {
      elWidth = Math.floor(bbox.width - VisualPadding.total)
      elHeight = Math.floor(elWidth / aspectRatio)
    } else if (scaleLimit === 'height') {
      elHeight = Math.floor(bbox.height - VisualPadding.total)
      elWidth = Math.floor(elHeight * aspectRatio)
    } else {
      throw new Error('unexpected scaleLimit')
    }

    let elPosX = 0
    let elPosY = 0

    const fixX = () => {
      if (elPosX < VisualPadding.border) {
        elPosX = VisualPadding.border
        return
      }
      if (elPosX + elWidth > viewportWidth - VisualPadding.border) {
        elPosX = viewportWidth - VisualPadding.border - elWidth
        return
      }
    }
    const fixY = () => {
      if (elPosY < VisualPadding.border) {
        elPosY = VisualPadding.border
        return
      }
      if (elPosY + elHeight > viewportHeight - VisualPadding.border) {
        elPosY = viewportHeight - VisualPadding.border - elHeight
        return
      }
    }

    switch (direction) {
      case 'top':
        elPosX = cardRect.x + cardRect.width / 2 - elWidth / 2
        elPosY = cardRect.top - VisualPadding.card - elHeight
        fixX()
        break
      case 'bottom':
        elPosX = cardRect.x + cardRect.width / 2 - elWidth / 2
        elPosY = cardRect.bottom + VisualPadding.card
        fixX()
        break
      case 'right':
        elPosX = cardRect.right + VisualPadding.card
        elPosY = cardRect.y + cardRect.height / 2 - elHeight / 2
        fixY()
        break
      case 'left':
        elPosX = cardRect.left - VisualPadding.card - elWidth
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
    calculatePostion()
  })

  useEventListener('resize', calculatePostionThrottled, { target: window })
  useEventListener('scroll', calculatePostionThrottled, { target: window })

  const direction = position?.direction
  const initial = useMemo(() => {
    if (!direction) return
    const { axis, multiplier } = DirectionConfig[direction]
    const animateDistance = 20
    if (axis === 'x') {
      return { x: -multiplier * animateDistance, y: 0 }
    }
    if (axis === 'y') {
      return { x: 0, y: -multiplier * animateDistance }
    }
  }, [direction])

  // as a placeholder, to get cardRect
  const videoCardDescendant = <div ref={ref} data-role='video-card-descendant'></div>

  const el = (
    <div
      {...restProps}
      ref={forwardedRef}
      css={[
        css`
          display: ${visible ? 'block' : 'none'};
        `,
        position &&
          css`
            position: fixed;
            z-index: ${zIndexVideoCardLargePreview};
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

  return (
    <>
      {videoCardDescendant}

      {/* safari container-type still use layout containment */}
      {/* https://stackoverflow.com/a/74606435/2822866 */}
      {isSafari ? createPortal(el, document.body) : el}
    </>
  )
})
