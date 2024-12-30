import { APP_CLS_CARD, appLog } from '$common'
import { colorPrimaryValue } from '$components/css-vars'
import { css } from '@emotion/react'
import { useEventListener } from 'ahooks'
import { orderBy, throttle } from 'es-toolkit'
import type { ComponentRef, ReactNode } from 'react'

type Direction = 'top' | 'right' | 'bottom' | 'left'
type Bbox = { x: number; y: number; width: number; height: number }

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

export const LargePreview = forwardRef<ComponentRef<'div'>, { children?: ReactNode }>(
  ({ children }, forwardedRef) => {
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

    const calculatePostion = useMemoizedFn(() => {
      const card = ref.current?.closest('.' + APP_CLS_CARD)
      if (!card) return

      const viewportWidth = document.documentElement.clientWidth
      const viewportHeight = document.documentElement.clientHeight
      const cardRect = card.getBoundingClientRect()

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

      const aspectRatio = 16 / 9
      const getScaleInBox = (bbox: Bbox) => {
        const w = aspectRatio
        const h = 1
        const scale = Math.min(bbox.width / w, bbox.height / h)
        return scale
      }

      const picked = orderBy(
        Object.entries(possibleBoundingBox).map(([direction, bbox]) => ({
          direction: direction as Direction,
          bbox,
          scale: getScaleInBox(bbox),
        })),
        ['scale'],
        ['desc'],
      )[0]

      const { direction, bbox, scale } = picked
      appLog('picked', picked)

      const elHeight = Math.floor(scale) - 40 /* padding */
      const elWidth = Math.floor(elHeight * aspectRatio)

      let elPosX = 0
      let elPosY = 0
      const visualPadding = 20

      const fixX = () => {
        if (elPosX < visualPadding) {
          elPosX = visualPadding
          return
        }
        if (elPosX + elWidth > viewportWidth - visualPadding) {
          elPosX = viewportWidth - visualPadding - elWidth
          return
        }
      }
      const fixY = () => {
        if (elPosY < visualPadding) {
          elPosY = visualPadding
          return
        }
        if (elPosY + elHeight > viewportHeight - visualPadding) {
          elPosY = viewportHeight - visualPadding - elHeight
          return
        }
      }

      switch (direction) {
        case 'top':
          elPosX = cardRect.x + cardRect.width / 2 - elWidth / 2
          elPosY = cardRect.top - visualPadding - elHeight
          fixX()
          break
        case 'bottom':
          elPosX = cardRect.x + cardRect.width / 2 - elWidth / 2
          elPosY = cardRect.bottom + visualPadding
          fixX()
          break
        case 'right':
          elPosX = cardRect.right + visualPadding
          elPosY = cardRect.y + cardRect.height / 2 - elHeight / 2
          fixY()
          break
        case 'left':
          elPosX = cardRect.left - visualPadding - elWidth
          elPosY = cardRect.y + cardRect.height / 2 - elHeight / 2
          fixY()
          break
      }

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

    return (
      <div
        ref={ref}
        css={[
          css`
            display: ${visible ? 'block' : 'none'};
            background-color: rgba(255 255 255 / 0.5);
            backdrop-filter: blur(10px);
            border: 1px solid ${colorPrimaryValue};
            border-radius: 20px;
            overflow: hidden;
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
        {visible && children}
      </div>
    )
  },
)
