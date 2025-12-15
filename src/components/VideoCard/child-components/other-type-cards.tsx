import { OPERATION_FAIL_MSG } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { delDislikeId } from '$components/ModalDislike'
import { antMessage } from '$modules/antd'
import { UserBlacklistService } from '$modules/bilibili/me/relations/blacklist'
import { parseUpRepresent } from '$modules/filter/parse'
import { IconForBlacklist, IconForReset } from '$modules/icon'
import { settings, updateSettingsInnerArray } from '$modules/settings'
import { toastRequestFail } from '$utility/toast'
import type { DislikeReason } from '$components/ModalDislike'
import type { AppRecItemExtend, RecItemType } from '$define'
import type { IVideoCardData } from '$modules/filter/normalize'
import { videoCardBorderRadiusValue } from '../../css-vars'
import { videoCardDefaultEmitter } from '../index.shared'
import { cancelDislike } from '../services'
import type { VideoCardEmitter } from '../index.shared'
import { skeletonActive as clsSkeletonActive } from './skeleton.module.scss'
import { VideoCardBottom } from './VideoCardBottom'

export const SkeletonCard = memo(function SkeletonCard({ loading }: { loading: boolean }) {
  return (
    <div
      className={clsx('bili-video-card__skeleton', {
        hide: !loading,
        [clsSkeletonActive]: loading,
      })}
    >
      <div className='bili-video-card__skeleton--cover' style={{ borderRadius: videoCardBorderRadiusValue }} />
      <div className='bili-video-card__skeleton--info px-5px'>
        <div className='bili-video-card__skeleton--avatar size-32px rounded-full' />
        <div className='bili-video-card__skeleton--right ml-10px flex-1'>
          <p className='bili-video-card__skeleton--text'></p>
          <p className='bili-video-card__skeleton--text short'></p>
          <p className='bili-video-card__skeleton--light'></p>
          <p className='bili-video-card__skeleton--text tiny'></p>
        </div>
      </div>
    </div>
  )
})

const blockedCardClassNames = {
  // grid align-items 默认为 stretch, 同 row 互相撑起高度
  wrapper: 'h-full flex flex-col overflow-hidden',
  cover: 'relative aspect-16/9 rounded-t-6px',
  coverInner: 'absolute left-0 top-0 h-full w-full flex flex-col items-center justify-center',
  dislikeReason: 'text-center font-size-20px',
  dislikeDesc: 'text-center text-16px',
  action: 'relative flex-1',
  actionInner:
    'absolute left-0 top-0 h-full w-full flex items-center justify-center b-t-1px b-t-[var(--bilibili-gate-separator-color)] b-t-solid transition-duration-300 transition-property-[border-color]',
  actionButton: 'flex items-center p-15px text-16px color-inherit',
}

export const DislikedCard = memo(function DislikedCard({
  item,
  cardData,
  dislikedReason,
  emitter = videoCardDefaultEmitter,
}: {
  item: AppRecItemExtend
  cardData: IVideoCardData
  dislikedReason: DislikeReason
  emitter?: VideoCardEmitter
}) {
  const onCancelDislike = useMemoizedFn(async () => {
    if (!dislikedReason?.id) return

    let success = false
    let message = ''
    let err: Error | undefined
    try {
      ;({ success, message } = await cancelDislike(item, dislikedReason.id))
    } catch (e) {
      err = e as Error
    }
    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    if (success) {
      antMessage.success('已撤销')
      delDislikeId(item.param)
    } else {
      antMessage.error(message || OPERATION_FAIL_MSG)
    }
  })

  useEmitterOn(emitter, 'cancel-dislike', onCancelDislike)

  return (
    <div className={blockedCardClassNames.wrapper}>
      <div className={blockedCardClassNames.cover}>
        <div className={blockedCardClassNames.coverInner}>
          <IconParkOutlineDistraughtFace className='mb-5px size-32px' />
          <div className={blockedCardClassNames.dislikeReason}>{dislikedReason?.name}</div>
          <div className={blockedCardClassNames.dislikeDesc}>{dislikedReason?.toast || '将减少此类内容推荐'}</div>
        </div>
      </div>
      <__BottomRevertAction item={item} cardData={cardData} onClick={onCancelDislike} />
    </div>
  )
})

function __BottomRevertAction({
  item,
  cardData,
  onClick,
}: {
  item: RecItemType
  cardData: IVideoCardData
  onClick: () => void
}) {
  return (
    <div className={blockedCardClassNames.action}>
      {/* 需要它撑起高度 */}
      <VideoCardBottom item={item} cardData={cardData} className='invisible' />
      <div className={blockedCardClassNames.actionInner}>
        <button className={blockedCardClassNames.actionButton} onClick={onClick}>
          <IconForReset className='mr-4px mt--2px size-16px' />
          撤销
        </button>
      </div>
    </div>
  )
}

export const BlockedCard = memo(function BlockedCardInner({
  item,
  cardData,
  blockType,
}: {
  item: RecItemType
  cardData: IVideoCardData
  blockType: 'blacklist' | 'filter'
}) {
  const { authorMid, authorName } = cardData
  const label = blockType === 'blacklist' ? '已拉黑' : '已加入过滤列表'

  const onCancel = useMemoizedFn(() => {
    return blockType === 'blacklist' ? onCancelBlacklist() : onCancelFilter()
  })
  const onCancelBlacklist = useMemoizedFn(async () => {
    if (!authorMid) return
    const success = await UserBlacklistService.remove(authorMid)
    if (success) antMessage.success(`已移出黑名单: ${authorName}`)
  })
  const onCancelFilter = useMemoizedFn(() => {
    if (!authorMid) return
    const toRemove = settings.filter.byAuthor.keywords.filter((keyword) => parseUpRepresent(keyword).mid === authorMid)
    updateSettingsInnerArray('filter.byAuthor.keywords', { remove: toRemove })
    antMessage.success(`已移出过滤列表: ${authorName}`)
  })

  return (
    <div className={blockedCardClassNames.wrapper}>
      <div className={blockedCardClassNames.cover}>
        <div className={blockedCardClassNames.coverInner}>
          <IconForBlacklist className='mb-5px size-32px' />
          <div className={blockedCardClassNames.dislikeReason}>{label}</div>
          <div className={blockedCardClassNames.dislikeDesc}>UP: {authorName}</div>
        </div>
      </div>
      <__BottomRevertAction item={item} cardData={cardData} onClick={onCancel} />
    </div>
  )
})
