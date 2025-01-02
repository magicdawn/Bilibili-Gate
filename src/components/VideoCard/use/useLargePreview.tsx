import { APP_CLS_CARD } from '$common'
import { useMittOn } from '$common/hooks/useMitt'
import { useRefStateBox, type RefStateBox } from '$common/hooks/useRefState'
import type { RecItemType } from '$define'
import { IconForLoading } from '$modules/icon'
import { shouldDisableShortcut } from '$utility/dom'
import { css } from '@emotion/react'
import { useClickAway, useHover, useRequest } from 'ahooks'
import type { ComponentRef, MutableRefObject } from 'react'
import { LargePreview } from '../child-components/LargePreview'
import { RecoverableVideo } from '../child-components/RecoverableVideo'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import { type SharedEmitter } from '../index.shared'
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
  cover,
  sharedEmitter,
  uniqId,
  cardRef,
}: {
  actionButtonVisible: boolean
  hasLargePreviewActionButton: boolean
  shouldFetchPreviewData: boolean
  tryFetchVideoPreviewData: () => void
  videoPreviewDataBox: RefStateBox<VideoPreviewData | undefined>
  item: RecItemType
  cover: string | undefined
  sharedEmitter: SharedEmitter
  uniqId: string
  cardRef: MutableRefObject<ComponentRef<'div'> | null>
}) {
  const $req = useRequest(async () => tryFetchVideoPreviewData(), { manual: true })

  const [visible, setVisible] = useState(false)
  const triggerFrom = useRefStateBox<'hover' | 'click' | undefined>(undefined)
  const showBy = useMemoizedFn((trigger: 'hover' | 'click') => {
    setVisible(true)
    triggerFrom.set(trigger)
    sharedEmitter.emit('show-large-preview', uniqId)
  })
  const hide = useMemoizedFn(() => {
    setVisible(false)
    triggerFrom.set(undefined)
  })
  useMittOn(sharedEmitter, 'show-large-preview', (srcUniqId) => {
    if (srcUniqId === uniqId) return
    hide()
  })

  const enterTimer = useRef<ReturnType<typeof setTimeout>>()
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>()
  const onMouseEnter = useMemoizedFn(() => {
    if (triggerFrom.val === 'click') return
    $req.run()
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    enterTimer.current = setTimeout(() => showBy('hover'), 400) // 不要太敏感啊~
  })
  const onMouseLeave = useMemoizedFn(() => {
    if (triggerFrom.val === 'click') return
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(hide, 200) // give user a chance to hover on `popover` content
  })
  const onClick = useMemoizedFn(() => {
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    showBy('click')
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

  const largePreviewRef = useRef<ComponentRef<'div'>>(null)
  const isHoveringOnLargePreview = useHover(largePreviewRef)
  const itemDimension = useMemo(
    () => getRecItemDimension(item, videoPreviewDataBox.state?.dimension),
    [item, videoPreviewDataBox.state?.dimension],
  )
  const videoCurrentTimeRef = useRef<number | undefined>(undefined)
  const willRenderLargePreview =
    (visible || isHoveringOnLargePreview) && !!videoPreviewDataBox.state?.playUrls?.length
  const largePreviewEl = willRenderLargePreview && (
    <LargePreview ref={largePreviewRef} aspectRatio={itemDimension.aspectRatio}>
      <RecoverableVideo
        currentTimeRef={videoCurrentTimeRef}
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
            <IconMaterialSymbolsScreenshotMonitorOutline className='size-16px' />
          )
        }
        tooltip={'浮动预览'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick()
        }}
      />
    )

  return { largePreviewActionButtonEl, largePreviewEl }
}
