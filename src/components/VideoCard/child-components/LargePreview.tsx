import { APP_CLS_CARD, APP_CLS_CARD_COVER, baseDebug } from '$common'
import { zIndexVideoCardLargePreview } from '$common/css-vars-export.module.scss'
import { useMixedRef } from '$common/hooks/mixed-ref'
import { colorPrimaryValue } from '$components/css-vars'
import { isSafari } from '$ua'
import { css as _css, css } from '@emotion/react'
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
  card: 10,
}

export const LargePreview = forwardRef<
  ComponentRef<'div'>,
  { children?: ReactNode; aspectRatio?: number } & ComponentProps<'div'>
>(({ children, aspectRatio = AspectRatioPreset.Horizontal, ...restProps }, forwardedRef) => {
  const ref = useRef<ComponentRef<'div'> | null>(null)
  const elRef = useMixedRef(forwardedRef)

  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<
    | {
        direction: Direction
        elWidth: number
        elHeight: number
        elPosX: number
        elPosY: number
        arrowTop: number
        arrowLeft: number
      }
    | undefined
  >(undefined)

  const hide = useMemoizedFn(() => {
    setVisible(false)
    setPosition(undefined)
  })

  const calculatePostion = useMemoizedFn(() => {
    const cardCover = ref.current
      ?.closest<HTMLDivElement>('.' + APP_CLS_CARD)
      ?.querySelector<HTMLAnchorElement>('.' + APP_CLS_CARD_COVER)
    if (!cardCover) return hide()

    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const cardCoverRect = cardCover.getBoundingClientRect()

    // invisible
    const tolerance = 40
    if (
      cardCoverRect.top > viewportHeight - tolerance ||
      cardCoverRect.bottom < 0 + tolerance ||
      cardCoverRect.left > viewportWidth - tolerance ||
      cardCoverRect.right < 0 + tolerance
    ) {
      return hide()
    }

    const possibleBoundingBox: Record<Direction, Bbox> = {
      top: { x: 0, y: 0, width: viewportWidth, height: cardCoverRect.top },
      bottom: {
        x: 0,
        y: cardCoverRect.bottom,
        width: viewportWidth,
        height: viewportHeight - cardCoverRect.bottom,
      },
      left: { x: 0, y: 0, width: cardCoverRect.left, height: viewportHeight },
      right: {
        x: cardCoverRect.right,
        y: 0,
        width: viewportWidth - cardCoverRect.right,
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
              return cardCoverRect.top
            case 'bottom':
              return viewportHeight - cardCoverRect.bottom
            case 'left':
              return cardCoverRect.left
            case 'right':
              return viewportWidth - cardCoverRect.right
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
      elWidth = Math.floor(bbox.width - (VisualPadding.card + VisualPadding.border))
      elHeight = Math.floor(elWidth / aspectRatio)
    } else if (scaleLimit === 'height') {
      elHeight = Math.floor(bbox.height - (VisualPadding.card + VisualPadding.border))
      elWidth = Math.floor(elHeight * aspectRatio)
    } else {
      throw new Error('unexpected scaleLimit')
    }

    let elPosX = 0
    let elPosY = 0

    let arrowTop = 0
    let arrowLeft = 0
    const setArrowTop = () => {
      arrowTop = cardCoverRect.y + cardCoverRect.height / 2 - elPosY
    }
    const setArrowLeft = () => {
      arrowLeft = cardCoverRect.x + cardCoverRect.width / 2 - elPosX
    }

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
        elPosX = cardCoverRect.x + cardCoverRect.width / 2 - elWidth / 2
        elPosY = cardCoverRect.top - VisualPadding.card - elHeight
        fixX()
        setArrowLeft()
        break
      case 'bottom':
        elPosX = cardCoverRect.x + cardCoverRect.width / 2 - elWidth / 2
        elPosY = cardCoverRect.bottom + VisualPadding.card
        fixX()
        setArrowLeft()
        break
      case 'right':
        elPosX = cardCoverRect.right + VisualPadding.card
        elPosY = cardCoverRect.y + cardCoverRect.height / 2 - elHeight / 2
        fixY()
        setArrowTop()
        break
      case 'left':
        elPosX = cardCoverRect.left - VisualPadding.card - elWidth
        elPosY = cardCoverRect.y + cardCoverRect.height / 2 - elHeight / 2
        fixY()
        setArrowTop()
        break
    }

    elPosX = Math.floor(elPosX)
    elPosY = Math.floor(elPosY)
    setVisible(true)
    setPosition({ direction, elWidth, elHeight, elPosX, elPosY, arrowTop, arrowLeft })
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
      ref={elRef}
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
            position: relative;
            height: 100%;
          `}
        >
          {direction && (
            <PopoverArrow
              size={7}
              direction={direction}
              arrowTop={position.arrowTop}
              arrowLeft={position.arrowLeft}
            />
          )}
          <div
            css={css`
              background-color: rgba(255 255 255 / 0.5);
              backdrop-filter: blur(10px);
              /* border: 1px solid ${colorPrimaryValue}; */
              box-shadow: 0px 0px 1px 1px ${colorPrimaryValue};
              border-radius: 20px;
              height: 100%;
              overflow: hidden;
            `}
          >
            {children}
          </div>
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

function PopoverArrow({
  size,
  direction,
  arrowTop,
  arrowLeft,
}: {
  size: number
  direction: Direction
  arrowTop: number
  arrowLeft: number
}) {
  const { axis, multiplier, reverse } = DirectionConfig[direction]
  const extra = useMemo(() => {
    if (axis === 'x') {
      return _css`
        ${direction}: 100%;
        margin-${direction}: -1px;
        top: ${arrowTop}px;
        margin-top: -${size / 2}px;
      `
    } else {
      return _css`
        ${direction}: 100%;
        margin-${direction}: -1px;
        left: ${arrowLeft}px;
        margin-left: -${size / 2}px;
      `
    }
  }, [size, direction, axis, arrowTop, arrowLeft])

  return (
    <div
      css={[
        css`
          position: absolute;
          height: 0;
          width: 0;
          box-sizing: content-box;
          border: ${size}px solid transparent;
        `,
        extra,
        _css`
          border-${direction}-color: ${colorPrimaryValue};
        `,
      ]}
    />
  )
}
