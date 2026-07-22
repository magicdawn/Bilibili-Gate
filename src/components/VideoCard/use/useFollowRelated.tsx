import { useLockFn } from 'ahooks'
import { isNotNil } from 'es-toolkit'
import { useMemo } from 'react'
import { useTrackedSnapshot } from 'valtio-select'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { checkIsAppRecommend, checkIsLive, checkIsPcRecommend, type RecItemType } from '$define'
import { ETab } from '$enums'
import { followedMidSet, queryFollowedStatus } from '$modules/bilibili/me/relations/follow'
import { getFollowedStatus } from '$modules/filter'
import { getLoginStatus } from '$modules/login-status'
import type { IVideoCardData } from '$modules/filter/normalize'
import type { VideoCardEmitter } from '../index.shared'

export type FollowedStatusContext = ReturnType<typeof useInitFollowedStatusContext>

export function useInitFollowedStatusContext(
  tab: ETab,
  item: RecItemType,
  cardData: IVideoCardData,
  emitter: VideoCardEmitter,
) {
  const { authorMid } = cardData

  const followedFromCardData = useMemo(() => {
    if (isNotNil(cardData.followed)) return cardData.followed
    if (tab === ETab.DynamicFeed && checkIsLive(item)) return true // 关注的人的直播; ETab.DynamicFeed 其他 item 使用 cardData.followed
    if (tab === ETab.Live && checkIsLive(item)) return true // 关注的人的直播
    if (checkIsAppRecommend(item) || checkIsPcRecommend(item)) return getFollowedStatus(cardData.recommendReason)
  }, [tab, item, cardData])

  const followedFromApi = useTrackedSnapshot(followedMidSet, (set) => !!authorMid && set.has(authorMid.toString()))

  const updateFollowedStatus = useLockFn(async () => {
    if (!getLoginStatus()) return // not logined
    if (followedFromCardData !== undefined) return // already followed from card data
    if (!authorMid) return // must has valid mid
    // must from these tabs
    const allowedTabs = [ETab.Watchlater, ETab.Fav, ETab.History, ETab.Liked, ETab.SpaceUpload]
    if (!allowedTabs.includes(tab)) return
    // fetch
    await queryFollowedStatus(authorMid)
  })
  useEmitterOn(emitter, 'context-menu-open', updateFollowedStatus)

  const followed = followedFromCardData ?? followedFromApi ?? false

  return { followed, updateFollowedStatus }
}
