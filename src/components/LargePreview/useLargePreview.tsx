import {
  useClickAway,
  useEventListener,
  useKeyPress,
  useLockFn,
  useMemoizedFn,
  useRequest,
  useUpdateEffect,
} from 'ahooks'
import { getTargetElement } from 'ahooks/lib/utils/domTarget'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ComponentRef,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from 'react'
import { useSnapshot } from 'valtio'
import { APP_CLS_CARD, baseVerboseDebug, BiliDomain } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { useRefBox, useRefStateBox } from '$common/hooks/useRefState'
import { openNewTab } from '$modules/gm'
import { IconForLoading } from '$modules/icon'
import { settings } from '$modules/settings'
import { classListToSelector, shouldDisableShortcut } from '$utility/dom'
import { VideoCardActionButton } from '../VideoCard/child-components/VideoCardActions'
import { fetchVideoPreviewData, isVideoPreviewDataValid, type VideoPreviewData } from '../VideoCard/services'
import { getRecItemDimension } from '../VideoCard/use/useOpenRelated'
import { LargePreview } from './index'
import { RecoverableVideo } from './RecoverableVideo'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'
import type { CssProp } from '$utility/type'

type Timer = ReturnType<typeof setTimeout>
type TimerRef = RefObject<Timer | undefined>
function clearTimerRef(timerRef: TimerRef) {
  if (timerRef.current === undefined) return
  clearTimeout(timerRef.current)
  timerRef.current = undefined
}

const debugTrigger = baseVerboseDebug.extend('large-preview:trigger')

type UseLargePreviewOptions = {
  // videoPreview data
  shouldFetchPreviewData: boolean
  // render ActionButton?
  hasLargePreviewActionButton: boolean
  actionButtonVisible: boolean
  actionButtonCss?: CssProp
  actionButtonProps?: Partial<ComponentProps<typeof VideoCardActionButton>>
  // required data
  bvid: string
  cid?: number
  uniqId: string
  recSharedEmitter: RecSharedEmitter
  cardTarget: RefObject<HTMLElement | null> | HTMLElement
  // optional
  aspectRatioFromItem?: number
  cover?: string
  videoCardAsTriggerRef?: RefObject<HTMLElement | null>
}

export function useLargePreviewRelated({
  // videoPreview data
  shouldFetchPreviewData,
  // render ActionButton?
  hasLargePreviewActionButton,
  actionButtonVisible,
  actionButtonProps,
  actionButtonCss,
  // required data
  bvid,
  cid,
  uniqId,
  recSharedEmitter,
  cardTarget,
  // optional
  aspectRatioFromItem,
  cover,
  videoCardAsTriggerRef,
}: UseLargePreviewOptions) {
  const { useMp4, useVideoCardAsTrigger, usePreferredCdn } = useSnapshot(settings.videoCard.videoPreview)

  const videoPreviewDataBox = useRefStateBox<VideoPreviewData | undefined>(undefined)
  const tryFetchVideoPreviewData = useLockFn(async () => {
    if (!shouldFetchPreviewData) return
    if (isVideoPreviewDataValid(videoPreviewDataBox.val)) return // already fetched
    const data = await fetchVideoPreviewData({
      bvid,
      cid,
      useMp4,
      usePreferredCdn,
      aspectRatioFromItem,
    })
    videoPreviewDataBox.set(data)
  })
  useUpdateEffect(() => {
    videoPreviewDataBox.set(undefined)
  }, [useMp4, usePreferredCdn])

  const $req = useRequest(tryFetchVideoPreviewData, {
    manual: true,
    loadingDelay: 100, // if request is fast, do not show loading at all
  })

  const [visible, setVisible] = useState(false)
  type TriggerAction = 'hover' | 'click'
  type TriggerElement =
    | 'video-card-action-button'
    | 'popover'
    | 'popover-action-button'
    | 'popover-video-fullscreen-button'
    | 'video-card' // video-card as trigger
  const triggerAction = useRefStateBox<TriggerAction | undefined>(undefined)
  const triggerElement = useRefStateBox<TriggerElement | undefined>(undefined)
  const hideAt = useRefStateBox<number | undefined>(undefined)
  const hoveringRef = useRefBox<Partial<Record<TriggerElement, boolean>>>({})

  const isRecentlyHidden = useMemoizedFn(() => {
    if (!hideAt.val) return false
    return Date.now() - hideAt.val < 1200 // 1.2s
  })

  const enterTimer = useRef<Timer | undefined>(undefined)
  const leaveTimer = useRef<Timer | undefined>(undefined)
  const clearTimers = useMemoizedFn(() => {
    clearTimerRef(enterTimer)
    clearTimerRef(leaveTimer)
  })

  const showBy = useMemoizedFn((action: TriggerAction, el: TriggerElement) => {
    debugTrigger('%s: showBy %s %s', bvid, action, el)
    setVisible(true)
    triggerAction.set(action)
    triggerElement.set(el)
    recSharedEmitter.emit('show-large-preview', uniqId)
    hideAt.set(undefined)
  })
  const hide = useMemoizedFn((debug = true) => {
    if (debug) debugTrigger('%s: hide', bvid)
    setVisible(false)
    triggerAction.set(undefined)
    triggerElement.set(undefined)
    hideAt.set(Date.now())
  })
  useEmitterOn(recSharedEmitter, 'show-large-preview', ({ data: srcUniqId }) => {
    if (srcUniqId === uniqId) return
    clearTimers()
    hide(false) // when broadcast from other-card, do not output debug message
  })

  const onMouseEnter = useMemoizedFn((triggerEl: TriggerElement) => {
    debugTrigger('%s: onMouseEnter %s', bvid, triggerEl)
    hoveringRef.set({ ...hoveringRef.val, [triggerEl]: true })
    if (triggerAction.val === 'click') return

    $req.run()
    clearTimers()

    // 不要太敏感啊~
    let delayMs = 0
    if (triggerEl === 'video-card-action-button') delayMs = 200
    if (triggerEl === 'video-card') delayMs = 1000
    if (!delayMs) {
      showBy('hover', triggerEl)
    } else {
      enterTimer.current = setTimeout(() => showBy('hover', triggerEl), delayMs)
    }
  })
  const onMouseLeave = useMemoizedFn((triggerEl: TriggerElement) => {
    debugTrigger('%s: onMouseLeave %s', bvid, triggerEl)
    hoveringRef.set({ ...hoveringRef.val, [triggerEl]: false })
    if (triggerAction.val === 'click') return

    const checkHide = () => {
      // Q: WHY this needed?
      // A: 正常都是 onMouseLeave -> onMouseEnter, 但 videoCardAsTrigger 是使用 useEventListener 监听的, 它的 onMouseLeave 事件会比较迟
      //    这时候, 在 hide() 之前做逻辑检测, 忽略时间的触发顺序
      if (hoveringRef.val.popover) return
      if (hoveringRef.val['video-card-action-button']) return
      hide()
    }

    clearTimers()
    if (triggerEl === 'video-card-action-button' || triggerEl === 'video-card' || triggerEl === 'popover') {
      leaveTimer.current = setTimeout(checkHide, 250) // give user a chance to hover on `popover` content
    } else {
      checkHide()
    }
  })
  const onClick = useMemoizedFn((el: TriggerElement) => {
    clearTimers()
    if (triggerAction.val === 'click') {
      hide()
    } else {
      showBy('click', el)
    }
  })

  const getLargePreviewCurrentTime = useMemoizedFn(() => {
    if (!currentTimeRef.current) return
    return Math.floor(currentTimeRef.current)
  })

  const shouldUseLargePreviewCurrentTime = useMemoizedFn(() => {
    if (visible) return true
    if (isRecentlyHidden()) return true
    return false
  })

  const onOpenInNewTab = useMemoizedFn(() => {
    if (!bvid) return

    const u = new URL(`https://${BiliDomain.Main}/video/${bvid}`)
    const t = getLargePreviewCurrentTime()
    if (t) u.searchParams.set('t', t.toString())
    openNewTab(u.href)

    videoRef.current?.pause()
    hide()
  })

  const usingAspectRatio = useMemo(() => {
    return (
      getRecItemDimension({ dimensionFromApi: videoPreviewDataBox.state?.dimension })?.aspectRatio ??
      aspectRatioFromItem
    )
  }, [videoPreviewDataBox.state?.dimension])
  const videoRef = useRef<ComponentRef<typeof RecoverableVideo> | null>(null)
  const currentTimeRef = useRef<number | undefined>(undefined)
  const largePreviewRef = useRef<ComponentRef<typeof LargePreview> | null>(null)
  const willRenderLargePreview = visible && !!videoPreviewDataBox.state?.playUrls?.length
  let largePreviewEl: ReactNode
  {
    const _mouseEnter: MouseEventHandler<HTMLDivElement> = useCallback(() => onMouseEnter('popover'), [onMouseEnter])
    const _mouseLeave: MouseEventHandler<HTMLDivElement> = useCallback(() => onMouseLeave('popover'), [onMouseLeave])
    largePreviewEl = willRenderLargePreview && (
      <LargePreview
        ref={largePreviewRef}
        aspectRatio={usingAspectRatio}
        onMouseEnter={_mouseEnter}
        onMouseLeave={_mouseLeave}
        cardDescendantTarget={cardTarget}
      >
        <RecoverableVideo
          ref={videoRef}
          currentTimeRef={currentTimeRef}
          autoPlay
          controls
          loop
          poster={cover}
          className='size-full object-contain' // avoid 'cover', this video may goto fullscreen
        >
          {videoPreviewDataBox.state?.playUrls?.map((url, i) => (
            <source key={i} src={url} />
          ))}
        </RecoverableVideo>
        {/* action buttons */}
        <div className='absolute right-10px top-10px flex flex-row-reverse items-center justify-start gap-x-5px'>
          {triggerAction.state === 'click' ? (
            <VideoCardActionButton
              inlinePosition={'right'}
              icon={<IconRadixIconsCross2 className='size-14px' />}
              tooltip={'关闭'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                hide()
              }}
            />
          ) : (
            <VideoCardActionButton
              inlinePosition={'right'}
              icon={<IconParkOutlinePin className='size-14px' />}
              tooltip={'固定'}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick('popover-action-button')
              }}
            />
          )}
          <VideoCardActionButton
            inlinePosition={'right'}
            icon={<IconRadixIconsOpenInNewWindow className='size-14px' />}
            tooltip={'新窗口打开'}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenInNewTab()
            }}
          />
        </div>
      </LargePreview>
    )
  }

  let largePreviewActionButtonEl: ReactNode
  {
    const _onMouseEnter = useCallback(() => onMouseEnter('video-card-action-button'), [onMouseEnter])
    const _onMouseLeave = useCallback(() => onMouseLeave('video-card-action-button'), [onMouseLeave])
    const _onClick: MouseEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick('video-card-action-button')
      },
      [onClick],
    )
    largePreviewActionButtonEl = hasLargePreviewActionButton && shouldFetchPreviewData && (
      <VideoCardActionButton
        css={actionButtonCss}
        {...actionButtonProps}
        visible={actionButtonVisible}
        active={willRenderLargePreview}
        inlinePosition={'right'}
        icon={
          $req.loading ? <IconForLoading className='size-16px' /> : <IconParkOutlineVideoTwo className='size-15px' />
        }
        tooltip={triggerAction.state === 'click' ? (visible ? '关闭浮动预览' : '浮动预览') : '浮动预览'}
        onMouseEnter={_onMouseEnter}
        onMouseLeave={_onMouseLeave}
        onClick={_onClick}
      />
    )
  }

  /**
   * trigger by click, more ways to close
   */
  useKeyPress(
    'esc',
    () => {
      if (shouldDisableShortcut()) return
      hide()
    },
    { exactMatch: true },
  )
  useClickAway(
    () => hide(),
    [
      largePreviewRef, // click inside `LargePreview`, safari 中使用 createPortal 不再是 card descendant
      () => getTargetElement(cardTarget)?.closest(classListToSelector(APP_CLS_CARD, 'bili-video-card')), // click inside `bigger` card
    ],
  )

  /**
   * trigger by hover, when video goes into fullscreen, switch trigger to click
   * 这样可以防止 "一进入全屏, 马上触发 mouseleave, 触发关闭" 的 case
   */
  useEventListener(
    'fullscreenchange',
    () => {
      if (!document.fullscreenElement) return // exit fullscreen
      if (!visible || triggerAction.val === 'click') return // not showing LargePreview
      if (document.fullscreenElement === videoRef.current) {
        showBy('click', 'popover-video-fullscreen-button')
      }
    },
    { target: document },
  )

  // video-card as trigger
  const emptyRef = useRef<HTMLElement | null>(null)
  const target = videoCardAsTriggerRef || emptyRef
  useEventListener(
    'mouseenter',
    () => {
      if (!useVideoCardAsTrigger || !videoCardAsTriggerRef) return
      onMouseEnter('video-card')
    },
    { target },
  )
  useEventListener(
    'mouseleave',
    () => {
      if (!useVideoCardAsTrigger || !videoCardAsTriggerRef) return
      onMouseLeave('video-card')
    },
    { target },
  )

  return {
    largePreviewActionButtonEl,
    largePreviewEl,
    getLargePreviewCurrentTime,
    shouldUseLargePreviewCurrentTime,
    largePreviewVisible: visible,
    hideLargePreview: hide,
  }
}
