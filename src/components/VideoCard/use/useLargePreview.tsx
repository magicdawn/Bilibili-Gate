import { APP_CLS_CARD } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import { useRefStateBox, type RefStateBox } from '$common/hooks/useRefState'
import type { RecItemType } from '$define'
import { openNewTab } from '$modules/gm'
import { IconForLoading } from '$modules/icon'
import { shouldDisableShortcut } from '$utility/dom'
import { css } from '@emotion/react'
import { useClickAway, useRequest } from 'ahooks'
import type { ComponentRef, MutableRefObject } from 'react'
import { LargePreview } from '../child-components/LargePreview'
import { RecoverableVideo } from '../child-components/RecoverableVideo'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import { type SharedEmitter } from '../index.shared'
import type { IVideoCardData } from '../process/normalize'
import type { VideoPreviewData } from '../services'
import { getRecItemDimension } from './useOpenRelated'

export function useLargePreviewRelated({
  // videoPreview data
  shouldFetchPreviewData,
  tryFetchVideoPreviewData,
  videoPreviewDataBox,

  // render ActionButton
  actionButtonVisible,
  hasLargePreviewActionButton,

  // item
  item,
  cardData,
  sharedEmitter,
  cardRef,
}: {
  actionButtonVisible: boolean
  hasLargePreviewActionButton: boolean
  shouldFetchPreviewData: boolean
  tryFetchVideoPreviewData: () => void
  videoPreviewDataBox: RefStateBox<VideoPreviewData | undefined>
  item: RecItemType
  cardData: IVideoCardData
  sharedEmitter: SharedEmitter
  cardRef: MutableRefObject<ComponentRef<'div'> | null>
}) {
  const { uniqId } = item
  const { cover, bvid } = cardData

  const $req = useRequest(async () => tryFetchVideoPreviewData(), { manual: true })

  const [visible, setVisible] = useState(false)
  type TriggerAction = 'hover' | 'click'
  type TriggerElement = 'video-card-action-button' | 'popover' | 'popover-action-button'
  const triggerAction = useRefStateBox<TriggerAction | undefined>(undefined)
  const triggerEl = useRefStateBox<TriggerElement | undefined>(undefined)
  const showBy = useMemoizedFn((action: TriggerAction, el: TriggerElement) => {
    setVisible(true)
    triggerAction.set(action)
    triggerEl.set(el)
    sharedEmitter.emit('show-large-preview', uniqId)
  })
  const hide = useMemoizedFn(() => {
    setVisible(false)
    triggerAction.set(undefined)
    triggerEl.set(undefined)
  })
  useMittOn(sharedEmitter, 'show-large-preview', (srcUniqId) => {
    if (srcUniqId === uniqId) return
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    hide()
  })

  const enterTimer = useRef<ReturnType<typeof setTimeout>>()
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>()
  const onMouseEnter = useMemoizedFn((triggerEl: TriggerElement) => {
    if (triggerAction.val === 'click') return
    $req.run()
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    if (triggerEl === 'video-card-action-button') {
      enterTimer.current = setTimeout(() => showBy('hover', triggerEl), 400) // 不要太敏感啊~
    } else {
      showBy('hover', triggerEl)
    }
  })
  const onMouseLeave = useMemoizedFn((triggerEl: TriggerElement) => {
    if (triggerAction.val === 'click') return
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    if (triggerEl === 'video-card-action-button') {
      leaveTimer.current = setTimeout(hide, 250) // give user a chance to hover on `popover` content
    } else {
      hide()
    }
  })
  const onClick = useMemoizedFn((el: TriggerElement) => {
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    if (triggerAction.val === 'click') {
      hide()
    } else {
      showBy('click', el)
    }
  })

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
    () => cardRef.current?.closest('.' + APP_CLS_CARD),
  )

  const onOpenInNewTab = useMemoizedFn(() => {
    if (!bvid) return

    const u = new URL(`/video/${bvid}`, location.href)
    if (typeof currentTimeRef.current === 'number') {
      u.searchParams.set('t', Math.round(currentTimeRef.current).toString())
    }
    openNewTab(u.href)

    videoRef.current?.pause()
    hide()
  })

  const itemDimension = useMemo(
    () => getRecItemDimension(item, videoPreviewDataBox.state?.dimension),
    [item, videoPreviewDataBox.state?.dimension],
  )
  const videoRef = useRef<ComponentRef<typeof RecoverableVideo> | null>(null)
  const currentTimeRef = useRef<number | undefined>(undefined)
  const willRenderLargePreview = visible && !!videoPreviewDataBox.state?.playUrls?.length
  const largePreviewEl = willRenderLargePreview && (
    <LargePreview
      aspectRatio={itemDimension.aspectRatio}
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
        css={css`
          width: 100%;
          height: 100%;
          object-fit: contain;
        `}
      >
        {videoPreviewDataBox.state?.playUrls?.map((url, i) => <source key={i} src={url} />)}
      </RecoverableVideo>
      {/* action buttons */}
      <div
        css={css`
          position: absolute;
          right: 10px;
          top: 10px;
          display: flex;
          flex-direction: row-reverse;
          align-items: center;
          justify-content: flex-start;
          column-gap: 5px;
        `}
      >
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
          $req.loading ? (
            <IconForLoading className='size-16px' />
          ) : (
            <IconParkOutlineVideoTwo className='size-15px' />
          )
        }
        tooltip={
          triggerAction.state === 'click' ? (visible ? '关闭浮动预览' : '浮动预览') : '浮动预览'
        }
        onMouseEnter={(e) => onMouseEnter('video-card-action-button')}
        onMouseLeave={(e) => onMouseLeave('video-card-action-button')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick('video-card-action-button')
        }}
      />
    )

  return { largePreviewActionButtonEl, largePreviewEl }
}
