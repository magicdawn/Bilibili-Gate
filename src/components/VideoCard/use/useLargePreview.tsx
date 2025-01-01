import type { RefStateBox } from '$common/hooks/useRefState'
import { IconForLoading } from '$modules/icon'
import { useRequest } from 'ahooks'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import type { VideoPreviewData } from '../services'

export function useLargePreviewRelated({
  actionButtonVisible,
  hasLargePreviewActionButton,
  shouldFetchPreviewData,
  tryFetchVideoPreviewData,
  videoPreviewDataBox,
}: {
  actionButtonVisible: boolean
  hasLargePreviewActionButton: boolean
  shouldFetchPreviewData: boolean
  tryFetchVideoPreviewData: () => void
  videoPreviewDataBox: RefStateBox<VideoPreviewData | undefined>
}) {
  const [showLargePreview, setShowLargePreview] = useState(false)
  const $req = useRequest(async () => tryFetchVideoPreviewData(), { manual: true })

  const enterTimer = useRef<ReturnType<typeof setTimeout>>()
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>()
  const onMouseEnter = useMemoizedFn(() => {
    $req.run()
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    enterTimer.current = setTimeout(() => {
      setShowLargePreview(true)
    }, 400) // 不要太敏感啊~
  })
  const onMouseLeave = useMemoizedFn(() => {
    clearTimeout(enterTimer.current)
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => {
      setShowLargePreview(false)
    }, 200) // give user a chance to hover on `popover` content
  })

  const largePreviewActionButtonEl = hasLargePreviewActionButton /** settings */ &&
    shouldFetchPreviewData /** rec-item */ && (
      <VideoCardActionButton
        visible={actionButtonVisible}
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
        }}
      />
    )

  return {
    largePreviewActionButtonEl,
    showLargePreview,
  }
}
