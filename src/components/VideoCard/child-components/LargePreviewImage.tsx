import { APP_CLS_CARD, appLog } from '$common'
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

export function LargePreviewImage({ children }: { children?: ReactNode }) {
  const ref = useRef<ComponentRef<'div'>>(null)

  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<
    | {
        direction: Direction
        imgWidth: number
        imgHeight: number
        imgPosX: number
        imgPosY: number
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

    const imgHeight = Math.floor(scale) - 40 /* padding */
    const imgWidth = Math.floor(imgHeight * aspectRatio)

    let imgPosX = 0
    let imgPosY = 0
    const visualPadding = 20

    const fixX = () => {
      if (imgPosX < visualPadding) {
        imgPosX = visualPadding
        return
      }
      if (imgPosX + imgWidth > viewportWidth - visualPadding) {
        imgPosX = viewportWidth - visualPadding - imgWidth
        return
      }
    }
    const fixY = () => {
      if (imgPosY < visualPadding) {
        imgPosY = visualPadding
        return
      }
      if (imgPosY + imgHeight > viewportHeight - visualPadding) {
        imgPosY = viewportHeight - visualPadding - imgHeight
        return
      }
    }

    switch (direction) {
      case 'top':
        imgPosX = cardRect.x + cardRect.width / 2 - imgWidth / 2
        imgPosY = cardRect.top - visualPadding - imgHeight
        fixX()
        break
      case 'bottom':
        imgPosX = cardRect.x + cardRect.width / 2 - imgWidth / 2
        imgPosY = cardRect.bottom + visualPadding
        fixX()
        break
      case 'right':
        imgPosX = cardRect.right + visualPadding
        imgPosY = cardRect.y + cardRect.height / 2 - imgHeight / 2
        fixY()
        break
      case 'left':
        imgPosX = cardRect.left - visualPadding - imgWidth
        imgPosY = cardRect.y + cardRect.height / 2 - imgHeight / 2
        fixY()
        break
    }

    setVisible(true)
    setPosition({ direction, imgWidth, imgHeight, imgPosX, imgPosY })
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

  return (
    <div
      ref={ref}
      css={[
        css`
          display: ${visible ? 'block' : 'none'};
          background-color: rgba(255 255 255 / 0.5);
          backdrop-filter: blur(10px);
        `,
        position &&
          css`
            position: fixed;
            z-index: 90000;
            width: ${position.imgWidth}px;
            height: ${position.imgHeight}px;
            top: ${position.imgPosY}px;
            left: ${position.imgPosX}px;
          `,
      ]}
    >
      {visible && children}
    </div>
  )
}
