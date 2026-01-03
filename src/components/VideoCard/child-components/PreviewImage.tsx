import { useMemoizedFn, useMount } from 'ahooks'
import clsx from 'clsx'
import {
  forwardRef,
  memo,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'
import { minmax } from '$utility/num'
import { clsZPreviewImageWrapper } from '../index.shared'
import type { PvideoData } from '$define'

/**
 * 关于 `pointer-events: none`
 * see https://github.com/magicdawn/Bilibili-Gate/issues/112
 * useMouse 使用的是 document.addEventListener, 不用它响应 mousemove 事件
 */
const clsPreviewImageWrapper = clsx(
  'pointer-events-none absolute inset-0 overflow-hidden',
  clsZPreviewImageWrapper,
  'rounded-b-none rounded-t-gate-video-card', // 配合进度条, 底部不需要圆角
)

/**
 * previewProgress 代表进度条进度
 * previewT 代表将渲染的图片
 * 两个解耦, previewT 可以 fallback 到 `previewProgress * videoDuration`
 */
interface IProps {
  videoDuration: number
  pvideo?: PvideoData
  progress?: number
  t?: number
}

export type PreviewImageRef = {
  getT: () => number | undefined
}

export const PreviewImage = memo(
  forwardRef<PreviewImageRef, IProps & ComponentPropsWithoutRef<'div'>>(function (
    { videoDuration, pvideo, progress, t, className, ...restProps },
    ref,
  ) {
    const rootElRef = useRef<ComponentRef<'div'>>(null)
    const [size, setSize] = useState(() => ({ width: 0, height: 0 }))

    useMount(() => {
      const rect = rootElRef.current?.getBoundingClientRect()
      if (!rect) return
      setSize({ width: rect.width, height: rect.height })
    })

    const usingProgress = useMemo(() => {
      function getProgress(): number | undefined {
        if (typeof progress === 'number' && !Number.isNaN(progress)) return progress
        return 0
      }
      return minmax(getProgress() ?? 0, 0, 1)
    }, [progress])

    const usingT = useMemo(
      () => t ?? Math.floor((videoDuration || 0) * usingProgress),
      [t, videoDuration, usingProgress],
    )

    /**
     * expose ref as imperative handle
     * 使用 pvideo.index 获取也不是很准确, 缩略图与视频有几秒偏差~
     */
    const getT = useMemoizedFn(() => usingT)
    useImperativeHandle(ref, () => ({ getT }), [getT])

    const innerProps = {
      progress: usingProgress,
      t: usingT,
      pvideo: pvideo!,
      elWidth: size.width,
      elHeight: size.height,
    }

    return (
      <div {...restProps} ref={rootElRef} className={clsx(clsPreviewImageWrapper, className)}>
        {!!(pvideo && size.width && size.height && usingProgress) && <PreviewImageInner {...innerProps} />}
      </div>
    )
  }),
)

const PreviewImageInner = memo(function PreviewImageInner({
  t,
  progress,
  pvideo,
  elWidth,
  elHeight,
}: {
  t: number
  progress: number
  pvideo: PvideoData
  elWidth: number
  elHeight: number
}) {
  let index = useMemo(() => {
    return calcIndex(pvideo?.index || [], t) ?? 0
  }, [pvideo, t])

  const { img_x_len: colCount, img_y_len: rowCount, img_x_size: w, img_y_size: h } = pvideo
  const countPerPreview = rowCount * colCount

  index = index + 1 // 1 based
  const snapshotIndex = Math.floor(index / countPerPreview) // 0 based, 第几张
  const indexInSnapshot = index - snapshotIndex * countPerPreview // 这一张的第几个, 1 based

  const snapshotUrl = pvideo.image?.[snapshotIndex] || ''

  const indexRow = Math.floor(indexInSnapshot / colCount) + 1 // 1 based
  const indexCol = indexInSnapshot - (indexRow - 1) * colCount // 1 based

  // 缩放比例:
  // 从原始图片(rawWidth * rawHeight) 的 (startX, startY)点 中抠出 w*h
  // 缩放到 elementW * elementH, 放入 background 中
  // see https://stackoverflow.com/questions/50301190/how-to-scale-css-sprites-when-used-as-background-image

  const newImgWidth = elWidth * colCount
  const newImgHeight = elHeight * rowCount

  const startY = (indexRow - 1) * elHeight
  const startX = (indexCol - 1) * elWidth

  // console.log({
  //   t,
  //   indexRow,
  //   indexCol,
  //   img: pvideo.image,
  //   // elementW,
  //   // elementH,
  //   // startX,
  //   // startY,
  // })

  return (
    <div
      className='size-full'
      style={{
        backgroundColor: 'black', // 防止加载过程中闪屏
        backgroundImage: `url(${snapshotUrl})`,
        backgroundPosition: `-${startX}px -${startY}px`,
        backgroundSize: `${newImgWidth}px ${newImgHeight}px`,
      }}
    >
      <SimpleProgressBar progress={progress} />
    </div>
  )
})

export function SimpleProgressBar({ progress, className, ...props }: { progress: number } & ComponentProps<'div'>) {
  return (
    <div {...props} data-role='track' className={clsx('absolute inset-x-0 bottom-0 h-2px bg-gate-bg-lv1', className)}>
      <div data-role='bar' className='h-full bg-gate-primary' style={{ width: `${progress * 100}%` }} />
    </div>
  )
}

function calcIndex(arr: number[], t: number) {
  let index = findIndex(arr, t)

  if (index !== -1) {
    return index
  }

  // https://www.bilibili.com/video/av297635747
  // 没有后面的预览
  if (t > arr.at(-1)!) {
    index = arr.length - 1
  }
}

function findIndex(arr: number[], target: number): number {
  // O(n)
  // let index = arr.findIndex((val, index, arr) => {
  //   const nextVal = arr[index + 1]
  //   if (val <= target && target < nextVal) {
  //     return true
  //   } else {
  //     return false
  //   }
  // })

  let l = 0
  let r = arr.length - 1
  let possible = -1

  while (l <= r) {
    const mid = Math.floor((l + r) / 2)
    const mv = arr[mid]

    if (target === mv) {
      return mid
    }

    if (mv < target) {
      l = mid + 1
      possible = mid
    }
    // target < mv
    else {
      r = mid - 1
    }
  }

  if (possible === -1) return -1

  const v = arr[possible]
  const v1 = arr[possible + 1] ?? 0
  if (v < target && target < v1) {
    return possible
  } else {
    return -1
  }
}
