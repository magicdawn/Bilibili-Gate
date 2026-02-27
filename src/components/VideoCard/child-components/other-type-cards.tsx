import { useMemoizedFn } from 'ahooks'
import clsx from 'clsx'
import { memo, useMemo } from 'react'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { handleCancelDislike } from '$components/ModalDislike/api'
import { normalizeDislikeReason, type DislikeReason } from '$components/ModalDislike/types'
import { antMessage } from '$modules/antd'
import { UserBlacklistService } from '$modules/bilibili/me/relations/blacklist'
import { parseUpRepresent } from '$modules/filter/parse'
import { IconForBlacklist, IconForReset } from '$modules/icon'
import { settings, updateSettingsInnerArray } from '$modules/settings'
import { videoCardBorderRadiusValue } from '../../css-vars'
import { defaultVideoCardEmitter, type VideoCardEmitter } from '../index.shared'
import { skeletonActive as clsSkeletonActive } from './skeleton.module.scss'
import { VideoCardBottom } from './VideoCardBottom'
import type { RecItemType } from '$define'
import type { IVideoCardData } from '$modules/filter/normalize'

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
  coverInner: 'absolute left-0 top-0 h-full w-full flex flex-col items-center justify-center gap-y-2',
  dislikeReason: 'text-center text-1.4em',
  dislikeDesc: 'text-center text-1em',
  action: 'relative flex-1',
  actionInner:
    'absolute left-0 top-0 h-full w-full flex items-center justify-center b-t-1px b-t-$bilibili-gate--separator-color b-t-solid transition-duration-300 transition-property-[border-color]',
  actionButton: 'flex cursor-pointer items-center rounded-lg bg-transparent p-15px text-1.2em color-inherit',
} as const

export const DislikedCard = memo(function DislikedCard({
  item,
  cardData,
  dislikedReason,
  emitter = defaultVideoCardEmitter,
}: {
  item: RecItemType
  cardData: IVideoCardData
  dislikedReason: DislikeReason
  emitter?: VideoCardEmitter
}) {
  const onCancelDislike = useMemoizedFn(async () => {
    await handleCancelDislike(item, dislikedReason)
  })
  useEmitterOn(emitter, 'cancel-dislike', onCancelDislike)

  const { text, helpText } = useMemo(() => normalizeDislikeReason(dislikedReason), [dislikedReason])

  return (
    <div className={blockedCardClassNames.wrapper}>
      <div className={blockedCardClassNames.cover}>
        <div className={blockedCardClassNames.coverInner}>
          <IconParkOutlineDistraughtFace className='size-2.5em' />
          <div className={blockedCardClassNames.dislikeReason}>{text}</div>
          <div className={blockedCardClassNames.dislikeDesc}>{helpText || '将减少此类内容推荐'}</div>
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
          <IconForReset className='mr-4px mt--2px' />
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
          <IconForBlacklist className='size-32px' />
          <div className={blockedCardClassNames.dislikeReason}>{label}</div>
          <div className={blockedCardClassNames.dislikeDesc}>UP: {authorName}</div>
        </div>
      </div>
      <__BottomRevertAction item={item} cardData={cardData} onClick={onCancel} />
    </div>
  )
})
