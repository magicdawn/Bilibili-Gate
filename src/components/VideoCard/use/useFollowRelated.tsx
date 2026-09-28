import { useLockFn } from 'ahooks'
import { isNotNil } from 'es-toolkit'
import { useMemo } from 'react'
import { useTrackedSnapshot } from 'valtio-select'
import { checkIsAppRecommend, checkIsLive, checkIsPcRecommend, type RecItemType } from '$define'
import { EApiType } from '$enums'
import { queryFollowedStatus } from '$modules/bilibili/me/relations/follow'
import { followedMidSet } from '$modules/bilibili/me/relations/following-state'
import { getFollowedStatus } from '$modules/filter'
import { getLoginStatus } from '$modules/login-status'
import type { EventEmitter } from 'ahooks/lib/useEventEmitter'
import type { IVideoCardData } from '$modules/filter/normalize'

export type FollowedStatusContext = ReturnType<typeof useInitFollowedStatusContext>

export function useInitFollowedStatusContext(
  item: RecItemType,
  cardData: IVideoCardData,
  contextMenuOpenEvent: EventEmitter<void>,
) {
  const { authorMid } = cardData

  const followedFromCardData = useMemo(() => {
    if (isNotNil(cardData.followed)) return cardData.followed
    if (checkIsLive(item)) return true // 关注的人的直播
    if (checkIsAppRecommend(item) || checkIsPcRecommend(item)) return getFollowedStatus(cardData.recommendReason)
  }, [item, cardData])

  const followedFromApi = useTrackedSnapshot(followedMidSet, (set) => !!authorMid && set.has(authorMid.toString()))

  const updateFollowedStatus = useLockFn(async () => {
    if (!authorMid) return // must has valid mid
    if (!getLoginStatus()) return // not logined
    if (followedFromCardData !== undefined) return // already followed from card data
    await queryFollowedStatus(authorMid)
  })
  contextMenuOpenEvent.useSubscription(() => {
    // allowed apiTypes
    const allowedApiTypes = [EApiType.Watchlater, EApiType.Fav, EApiType.History, EApiType.Liked, EApiType.SpaceUpload]
    if (!allowedApiTypes.includes(item.api)) return
    updateFollowedStatus()
  })

  const followed = followedFromCardData ?? followedFromApi ?? false

  return { followed, updateFollowedStatus }
}
