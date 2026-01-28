import { useEventListener, useMemoizedFn, useRafState, useUnmountedRef } from 'ahooks'
import { delay } from 'es-toolkit'
import { useMemo, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { __PROD__, appLog } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { useRefBox, useRefStateBox, type RefBox, type RefStateBox } from '$common/hooks/useRefState'
import { settings } from '$modules/settings'
import { minmax } from '$utility/num'
import { PreviewImage, type PreviewImageRef } from '../child-components/PreviewImage'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'
import type { ImagePreviewData } from '../services'

const DEBUG_ANIMATION = __PROD__
  ? false //
  : false // 👈🏻👈🏻👈🏻 dev: free to change
function debugAnimation(...args: Parameters<typeof appLog>) {
  if (!DEBUG_ANIMATION) return
  const [message, ...rest] = args
  appLog(`[animation] ${message}`, ...rest)
}

/**
 * 自动以动画方式预览
 */
export function usePreviewRelated({
  uniqId,
  recSharedEmitter,
  title,
  active,
  videoDuration,
  tryFetchImagePreviewData,
  imagePreviewDataBox,
  autoPreviewWhenHover,
  videoPreviewWrapperRef,
}: {
  uniqId: string
  recSharedEmitter: RecSharedEmitter
  title: string
  active: boolean
  videoDuration?: number
  tryFetchImagePreviewData: () => Promise<void>
  imagePreviewDataBox: RefStateBox<ImagePreviewData | undefined>
  autoPreviewWhenHover: boolean
  videoPreviewWrapperRef: RefObject<HTMLElement | null>
}) {
  const hasVideoData = useMemoizedFn(() => {
    const data = imagePreviewDataBox.val?.videoshotJson?.data
    return Boolean(data?.index?.length && data?.image?.length)
  })

  const [autoPreviewing, setAutoPreviewing] = useState(false)
  const [previewProgress, setPreviewProgress] = useRafState<number | undefined>()
  const [previewT, setPreviewT] = useRafState<number | undefined>()
  const getProgress = useMemoizedFn(() => previewProgress || 0)

  const [mouseMoved, setMouseMoved] = useState(false)

  // 在 pvideodata 加载的时候, useHover 会有变化, so 使用 mouseenter/mouseleave 自己处理
  const isHoveringBox = useRefStateBox(false)
  const isHoveringAfterDelayBox = useRefStateBox(false)
  const startByHoverBox = useRefBox(false)

  // mouseenter cursor state
  const [mouseProgress, setMouseProgress] = useState<number | undefined>(undefined)
  const updateMouseProgress = (e: MouseEvent) => {
    const rect = videoPreviewWrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    // https://github.com/alibaba/hooks/blob/v3.7.0/packages/hooks/src/useMouse/index.ts#L62
    const { x, width } = rect
    const relativeX = e.pageX - window.scrollX - x
    setMouseProgress(relativeX / width)
  }

  useEventListener(
    'mouseenter',
    async (e) => {
      recSharedEmitter.emit('mouseenter', uniqId)

      isHoveringBox.set(true)
      updateMouseProgress(e)

      // fetch data
      const p = tryFetchImagePreviewData()

      // delay
      const HOVER_DELAY = 800
      let delayPromise: Promise<void> | undefined
      if (settings.useDelayForHover) {
        delayPromise = delay(HOVER_DELAY)
      }

      // normal: fetch instantly, wait hover delay
      // abnormal: bad network, already delay caused by network, so no wait again
      await Promise.all([p, delayPromise].filter(Boolean))

      // mouse leave after delay
      if (!isHoveringBox.val) return

      // set delay flag
      isHoveringAfterDelayBox.set(true)

      // start preview animation
      if (autoPreviewWhenHover && !idBox.val && hasVideoData()) {
        debugAnimation(`mouseenter onStartPreviewAnimation uniqId=%s title=%s`, uniqId, title)
        onStartPreviewAnimation(true)
      }
    },
    { target: videoPreviewWrapperRef },
  )

  // mouseleave
  const _mouseleaveAction = useMemoizedFn(() => {
    isHoveringBox.set(false)
    isHoveringAfterDelayBox.set(false)
  })
  useEventListener('mouseleave', _mouseleaveAction, { target: videoPreviewWrapperRef })
  useEmitterOn(recSharedEmitter, 'mouseenter', (srcUniqId) => {
    if (srcUniqId === uniqId) return
    _mouseleaveAction()
  })

  useEventListener(
    'mousemove',
    (e: MouseEvent) => {
      setMouseMoved(true)

      // update mouse enter state in mouseenter-delay
      if (isHoveringBox.val && (!isHoveringAfterDelayBox.val || !autoPreviewWhenHover)) {
        updateMouseProgress(e)
      }

      if (!autoPreviewWhenHover) {
        animationController.stop()
      }
    },
    { target: videoPreviewWrapperRef },
  )

  // raf id
  const idBox = useRefBox<number | undefined>(undefined)

  const onResume = useRef<(() => void) | undefined>(undefined)

  const animationController = useAnimationController({
    startByHoverBox,
    isHoveringBox,
    active,
    mouseMoved,
    idBox,
    autoPreviewWhenHover,
    setAutoPreviewing,
    setPreviewT,
    setPreviewProgress,
    onResume() {
      onResume.current?.()
    },
  })

  const onHotkeyPreviewAnimation = useMemoizedFn(async () => {
    // console.log('hotkey preview', animationPaused)
    if (!idBox.val) {
      await tryFetchImagePreviewData()
      if (hasVideoData()) {
        onStartPreviewAnimation(false)
      }
      return
    }

    // toggle
    animationController.togglePaused()
  })

  const onStartPreviewAnimation = useMemoizedFn((startByHover) => {
    startByHoverBox.set(startByHover)
    setMouseMoved(false)
    animationController.reset()
    animationController.stop(true) // clear existing

    setAutoPreviewing(true)
    setPreviewProgress((val) => (val === undefined ? 0 : val)) // get rid of undefined
    setPreviewT(undefined)

    const RUN_DURATION = 8000 // total ms
    let start = performance.now()
    let updateAt = 0

    // resume()'s implementation
    onResume.current = () => {
      start = performance.now() - getProgress() * RUN_DURATION
    }

    function frame(t: number) {
      // stop
      if (animationController.shouldStop()) {
        return animationController.stop()
      }

      if (!animationController.paused) {
        const now = performance.now()
        const elapsed = now - start
        const p = minmax((elapsed % RUN_DURATION) / RUN_DURATION, 0, 1)

        setPreviewProgress(p)

        if (!updateAt || now - updateAt >= settings.autoPreviewUpdateInterval) {
          setPreviewProgress(p)

          updateAt = now
          if (videoDuration) {
            const t = minmax(Math.round(p * videoDuration), 0, videoDuration)
            setPreviewT(t)
          }
        }
      }

      idBox.val = requestAnimationFrame(frame)
    }

    idBox.val = requestAnimationFrame(frame)
  })

  const isHovering = isHoveringBox.state
  const isHoveringAfterDelay = isHoveringAfterDelayBox.state

  const videoshotData = imagePreviewDataBox.state?.videoshotJson?.data
  const shouldShowPreview =
    !!videoshotData?.image?.length &&
    !!videoDuration &&
    (isHoveringAfterDelay || active) &&
    (autoPreviewWhenHover ? autoPreviewing : true)

  const previewImageRef = useRef<PreviewImageRef>(null) // to expose imperative `getT()`
  let previewImgProps: ComponentProps<typeof PreviewImage> | undefined
  let previewImageEl: ReactNode
  if (shouldShowPreview) {
    const sharedProps = {
      videoDuration,
      pvideo: videoshotData,
    }
    if (autoPreviewWhenHover) {
      // auto-preview: start-by (hover | keyboard)
      previewImgProps = { ...sharedProps, progress: previewProgress, t: previewT }
    } else {
      // follow-mouse
      previewImgProps = { ...sharedProps, progress: mouseProgress }
    }
    previewImageEl = <PreviewImage ref={previewImageRef} {...previewImgProps} />
  }

  return {
    onHotkeyPreviewAnimation,
    onStartPreviewAnimation,
    autoPreviewing,
    mouseProgress,
    previewProgress,
    previewT,
    //
    isHovering,
    isHoveringAfterDelay,
    // el
    shouldShowPreview,
    previewImageRef,
    previewImgProps,
    previewImageEl,
  }
}

function useAnimationController({
  startByHoverBox,
  isHoveringBox,
  idBox,
  active,
  mouseMoved,
  autoPreviewWhenHover,
  setAutoPreviewing,
  setPreviewT,
  setPreviewProgress,
  onResume,
}: {
  startByHoverBox: RefBox<boolean>
  isHoveringBox: RefStateBox<boolean>
  idBox: RefBox<number | undefined>
  active: boolean
  mouseMoved: boolean
  autoPreviewWhenHover: boolean
  setAutoPreviewing: (autoPreviewing: boolean) => void
  setPreviewT: (t: number | undefined) => void
  setPreviewProgress: (p: number | undefined) => void
  onResume?: () => void
}) {
  const unmounted = useUnmountedRef()

  // 停止动画
  //  - 鼠标动了
  //  - 不再 active
  //  - 组件卸载了
  const shouldStop = useMemoizedFn(() => {
    if (unmounted.current) return true

    // mouse
    if (startByHoverBox.val) {
      if (!isHoveringBox.val) return true
    }
    // normal keyboard control
    else {
      if (!active) return true
      if (mouseMoved) return true
    }

    return false
  })

  const stop = useMemoizedFn((isClear = false) => {
    if (!isClear) {
      debugAnimation(`stopAnimation: %o`, {
        autoPreviewWhenHover,
        unmounted: unmounted.current,
        isHovering: isHoveringBox.val,
        active,
        mouseMoved,
      })
    }

    if (idBox.val) cancelAnimationFrame(idBox.val)
    idBox.val = undefined
    setAutoPreviewing(false)
    setPreviewProgress(undefined)
    setPreviewT(undefined)
    controller.reset()
  })

  const _paused = useRef(false)

  const controller = useMemo(() => {
    return {
      shouldStop,
      stop,

      get paused() {
        return _paused.current
      },
      set paused(val: boolean) {
        _paused.current = val
      },

      togglePaused() {
        const prev = this.paused
        this.paused = !this.paused
        if (prev) {
          // to resume
          onResume?.()
        } else {
          // to pause
        }
      },

      reset() {
        this.paused = false
      },
    }
  }, [shouldStop, stop, _paused, onResume])

  return controller
}
