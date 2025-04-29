import { APP_CLS_CARD, BiliDomain } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import { useRefStateBox } from '$common/hooks/useRefState'
import { openNewTab } from '$modules/gm'
import { IconForLoading } from '$modules/icon'
import { settings } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { useClickAway, useEventListener, useLockFn, useRequest } from 'ahooks'
import type { ComponentRef, MutableRefObject } from 'react'
import { useSnapshot } from 'valtio'
import { VideoCardActionButton } from '../VideoCard/child-components/VideoCardActions'
import { type SharedEmitter } from '../VideoCard/index.shared'
import { fetchVideoPreviewData, isVideoPreviewDataValid, type VideoPreviewData } from '../VideoCard/services'
import { getRecItemDimension } from '../VideoCard/use/useOpenRelated'
import { LargePreview } from './index'
import { RecoverableVideo } from './RecoverableVideo'

type Timer = ReturnType<typeof setTimeout>
type TimerRef = MutableRefObject<Timer | undefined>
function clearTimerRef(timerRef: TimerRef) {
  if (typeof timerRef.current === 'undefined') return
  clearTimeout(timerRef.current)
  timerRef.current = undefined
}

type UseLargePreviewOptions = {
  // videoPreview data
  shouldFetchPreviewData: boolean
  // render ActionButton?
  actionButtonVisible: boolean
  hasLargePreviewActionButton: boolean
  // required data
  bvid: string
  cid?: number
  uniqId: string
  sharedEmitter: SharedEmitter
  // optional
  aspectRatioFromItem?: number
  cover?: string
  cardRef?: MutableRefObject<ComponentRef<'div'> | null>
}

export function useLargePreviewRelated({
  // videoPreview data
  shouldFetchPreviewData,
  // render ActionButton?
  actionButtonVisible,
  hasLargePreviewActionButton,
  // required data
  bvid,
  cid,
  uniqId,
  sharedEmitter,
  // optional
  aspectRatioFromItem,
  cover,
  cardRef,
}: UseLargePreviewOptions) {
  const {
    useMp4,
    __internal: { preferNormalCdn },
  } = useSnapshot(settings.videoCard.videoPreview)

  const videoPreviewDataBox = useRefStateBox<VideoPreviewData | undefined>(undefined)
  const tryFetchVideoPreviewData = useLockFn(async () => {
    if (!shouldFetchPreviewData) return
    if (isVideoPreviewDataValid(videoPreviewDataBox.val)) return // already fetched
    const data = await fetchVideoPreviewData({
      bvid,
      cid,
      useMp4,
      preferNormalCdn,
      aspectRatioFromItem,
    })
    videoPreviewDataBox.set(data)
  })
  useUpdateEffect(() => {
    videoPreviewDataBox.set(undefined)
  }, [useMp4, preferNormalCdn])

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
  const triggerAction = useRefStateBox<TriggerAction | undefined>(undefined)
  const triggerElement = useRefStateBox<TriggerElement | undefined>(undefined)
  const hideAt = useRefStateBox<number | undefined>(undefined)

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
    setVisible(true)
    triggerAction.set(action)
    triggerElement.set(el)
    sharedEmitter.emit('show-large-preview', uniqId)
    hideAt.set(undefined)
  })
  const hide = useMemoizedFn(() => {
    setVisible(false)
    triggerAction.set(undefined)
    triggerElement.set(undefined)
    hideAt.set(Date.now())
  })
  useMittOn(sharedEmitter, 'show-large-preview', (srcUniqId) => {
    if (srcUniqId === uniqId) return
    clearTimers()
    hide()
  })

  const onMouseEnter = useMemoizedFn((triggerEl: TriggerElement) => {
    if (triggerAction.val === 'click') return
    $req.run()
    clearTimers()
    if (triggerEl === 'video-card-action-button') {
      enterTimer.current = setTimeout(() => showBy('hover', triggerEl), 200) // 不要太敏感啊~
    } else {
      showBy('hover', triggerEl)
    }
  })
  const onMouseLeave = useMemoizedFn((triggerEl: TriggerElement) => {
    if (triggerAction.val === 'click') return
    clearTimers()
    if (triggerEl === 'video-card-action-button') {
      leaveTimer.current = setTimeout(hide, 250) // give user a chance to hover on `popover` content
    } else {
      hide()
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
  const largePreviewEl = willRenderLargePreview && (
    <LargePreview
      ref={largePreviewRef}
      aspectRatio={usingAspectRatio}
      onMouseEnter={(e) => onMouseEnter('popover')}
      onMouseLeave={(e) => onMouseLeave('popover')}
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
        {videoPreviewDataBox.state?.playUrls?.map((url, i) => <source key={i} src={url} />)}
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

  const largePreviewActionButtonEl = hasLargePreviewActionButton /** settings */ &&
    shouldFetchPreviewData /** rec-item */ && (
      <VideoCardActionButton
        visible={actionButtonVisible}
        active={willRenderLargePreview}
        inlinePosition={'right'}
        icon={
          $req.loading ? <IconForLoading className='size-16px' /> : <IconParkOutlineVideoTwo className='size-15px' />
        }
        tooltip={triggerAction.state === 'click' ? (visible ? '关闭浮动预览' : '浮动预览') : '浮动预览'}
        onMouseEnter={(e) => onMouseEnter('video-card-action-button')}
        onMouseLeave={(e) => onMouseLeave('video-card-action-button')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick('video-card-action-button')
        }}
      />
    )

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
      cardRef ? () => cardRef?.current?.closest('.' + APP_CLS_CARD) : undefined, // click from card
      largePreviewRef, // click from `LargePreview`, safari 中使用 createPortal 不再是 card descendant
    ].filter(Boolean),
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

  return {
    largePreviewActionButtonEl,
    largePreviewEl,
    getLargePreviewCurrentTime,
    shouldUseLargePreviewCurrentTime,
    largePreviewVisible: visible,
    hideLargePreview: hide,
  }
}
