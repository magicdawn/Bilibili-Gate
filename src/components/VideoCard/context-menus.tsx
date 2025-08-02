/**
 * context menus related
 */

import { useSnapshot } from 'valtio'
import {
  copyBvidInfos,
  copyBvidsSingleLine,
  copyVideoLinks,
  currentGridItems,
  getBvidInfo,
} from '$components/RecGrid/unsafe-window-export'
import { ETab } from '$components/RecHeader/tab-enum'
import { isDynamicFeed, isLive, isSpaceUpload, type DynamicFeedItemExtend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { antMessage, antModal, defineAntMenus, type AntMenuItem } from '$modules/antd'
import { UserBlacklistService } from '$modules/bilibili/me/relations/blacklist'
import { UserfollowService } from '$modules/bilibili/me/relations/follow'
import { setNicknameCache } from '$modules/bilibili/user/nickname'
import { getFollowedStatus, isApiRecLike } from '$modules/filter'
import { openNewTab } from '$modules/gm'
import {
  IconForBlacklist,
  IconForCopy,
  IconForDislike,
  IconForDynamicFeed,
  IconForOpenExternalLink,
  IconForRemove,
  IconForSpaceUpload,
  IconForWatchlater,
} from '$modules/icon'
import { multiSelectStore } from '$modules/multi-select/store'
import {
  DF_SELECTED_KEY_ALL,
  DF_SELECTED_KEY_PREFIX_UP,
  dfStore,
  DynamicFeedQueryKey,
  QUERY_DYNAMIC_UP_MID,
} from '$modules/rec-services/dynamic-feed/store'
import { SHOW_SPACE_UPLOAD_ONLY, SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'
import { settings, updateSettingsInnerArray } from '$modules/settings'
import toast from '$utility/toast'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import type { IVideoCardData } from '$modules/filter/normalize'
import { copyContent } from './index.shared'
import { watchlaterAdd } from './services'
import { getFavTabMenus, getWatchlaterTabFavMenus, type FavContext } from './use/useFavRelated'
import type { WatchlaterRelatedContext } from './use/useWatchlaterRelated'

export function useContextMenus({
  item,
  cardData,
  tab,

  isNormalVideo,
  onRefresh,

  favContext,
  watchlaterContext,
  hasDislikeEntry,
  onTriggerDislike,

  onMoveToFirst,
  onRemoveCurrent,

  consistentOpenMenus,
  conditionalOpenMenus,

  multiSelecting,
}: {
  item: RecItemType
  cardData: IVideoCardData
  tab: ETab

  isNormalVideo: boolean
  onRefresh: OnRefresh | undefined

  watchlaterContext: WatchlaterRelatedContext
  favContext: FavContext
  hasDislikeEntry: boolean
  onTriggerDislike: () => unknown

  onMoveToFirst: ((item: RecItemType, data: IVideoCardData) => void | Promise<void>) | undefined
  onRemoveCurrent: ((item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>) | undefined

  consistentOpenMenus: AntMenuItem[]
  conditionalOpenMenus: AntMenuItem[]

  multiSelecting?: boolean
}): AntMenuItem[] {
  const {
    avid,
    bvid,
    cover,
    href,
    recommendReason,

    // author
    authorName,
    authorMid,
  } = cardData

  const { enableHideSomeContents } = useSnapshot(settings.dynamicFeed.whenViewAll)

  const onCopyLink = useMemoizedFn(() => {
    let content = href
    if (href.startsWith('/')) {
      content = new URL(href, location.href).href
    }
    copyContent(content)
  })

  /**
   * blacklist
   */
  // 已关注 item.api 也为 'pc',
  const hasBlacklistEntry = !!authorMid && isApiRecLike(item.api) && tab !== ETab.KeepFollowOnly

  const onBlacklistUp = useMemoizedFn(async () => {
    if (!authorMid) return antMessage.error('UP mid 为空!')
    const success = await UserBlacklistService.add(authorMid)
    if (success) {
      antMessage.success(`已加入黑名单: ${authorName}`)
    }
  })

  const onAddUpToFilterList = useMemoizedFn(async () => {
    if (!authorMid) return antMessage.error('UP mid 为空!')

    const content = `${authorMid}`
    if (settings.filter.byAuthor.keywords.includes(content)) {
      return toast(`已在过滤名单中: ${content}`)
    }

    await updateSettingsInnerArray('filter.byAuthor.keywords', { add: [content] })
    if (authorName) setNicknameCache(authorMid, authorName)

    let toastContent = content
    if (authorName) toastContent += ` 用户名: ${authorName}`
    antMessage.success(`已加入过滤名单: ${toastContent}, 刷新后生效~`)
  })

  /**
   * unfollow
   */
  const followed =
    item.api === EApiType.DynamicFeed ||
    ((item.api === EApiType.AppRecommend || item.api === EApiType.PcRecommend) && getFollowedStatus(recommendReason))
  const hasUnfollowEntry = followed
  const onUnfollowUp = useMemoizedFn(async () => {
    if (!authorMid) return

    const confirm = await antModal.confirm({
      centered: true,
      title: '取消关注',
      content: <>确定取消关注「{authorName}」?</>,
    })
    if (!confirm) return

    const success = await UserfollowService.unfollow(authorMid)
    if (success) {
      antMessage.success('已取消关注')
    }
  })

  /**
   * 查看 UP 的动态 或 投稿
   */
  const hasViewUpVideoListEntry = (isNormalVideo || isLive(item)) && !!authorMid && !!authorName
  const onViewUpDyn = useMemoizedFn(() => {
    if (!hasViewUpVideoListEntry) return
    const u = `/?${DynamicFeedQueryKey.Mid}=${authorMid}`
    openNewTab(u)
  })
  const onViewUpSpaceUpload = useMemoizedFn(() => {
    if (!hasViewUpVideoListEntry) return
    const u = `/?${SpaceUploadQueryKey.Mid}=${authorMid}`
    openNewTab(u)
  })

  /**
   * 「全部」动态筛选
   */

  // 不再 stick on camelCase 后, 腰不酸了, 腿不疼了~
  const hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds =
    enableHideSomeContents && isDynamicFeed(item) && dfStore.selectedKey === DF_SELECTED_KEY_ALL && !!authorMid
  const onAddMidTo_dynamicFeedWhenViewAllHideIds = useMemoizedFn(async () => {
    if (!hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds) return
    await updateSettingsInnerArray('dynamicFeed.whenViewAll.hideIds', {
      add: [DF_SELECTED_KEY_PREFIX_UP + authorMid],
    })
    setNicknameCache(authorMid, authorName || '')
    antMessage.success(`在「全部」动态中隐藏【${authorName}】的动态`)
  })

  /**
   * 动态 offset & minId
   */
  const hasEntry_dynamicFeed_offsetAndMinId = !!(
    isDynamicFeed(item) &&
    QUERY_DYNAMIC_UP_MID &&
    dfStore.viewingSomeUp &&
    authorMid
  )
  const dynamicViewStartFromHere: AntMenuItem | false = useMemo(
    () =>
      hasEntry_dynamicFeed_offsetAndMinId && {
        label: '动态: 从此项开始查看',
        key: '动态: 从此项开始查看',
        icon: <IconTablerSortDescending2 className='size-17px' />,
        onClick() {
          const u = new URL('/', location.href)
          u.searchParams.set(DynamicFeedQueryKey.Mid, authorMid)
          const currentIndexInGrid = currentGridItems.findIndex(
            (x) => x.api === EApiType.DynamicFeed && x.id_str === item.id_str,
          )
          const prevIdStr =
            (currentGridItems[currentIndexInGrid - 1] as DynamicFeedItemExtend | undefined)?.id_str || item.id_str // 上一项的 id_str
          u.searchParams.set(DynamicFeedQueryKey.Offset, prevIdStr)
          openNewTab(u.href)
        },
      },
    [hasEntry_dynamicFeed_offsetAndMinId, item],
  )
  const dynamicViewUpdateSinceThis: AntMenuItem | false = useMemo(
    () =>
      hasEntry_dynamicFeed_offsetAndMinId && {
        icon: <IconTablerSortAscending2 className='size-17px' />,
        label: '动态: 从此项开始截止',
        key: '动态: 从此项开始截止',
        onClick() {
          const u = new URL('/', location.href)
          u.searchParams.set(DynamicFeedQueryKey.Mid, authorMid)
          u.searchParams.set(DynamicFeedQueryKey.MinId, item.id_str)
          openNewTab(u.href)
        },
      },
    [hasEntry_dynamicFeed_offsetAndMinId, item],
  )

  /**
   * space-upload offset
   */
  const spaceUploadViewStartFromHere: AntMenuItem | false = useMemo(
    () =>
      SHOW_SPACE_UPLOAD_ONLY &&
      isSpaceUpload(item) &&
      !!item.page && {
        key: 'space-upload-view-start-from-here',
        label: `投稿: 从此页开始查看 (${item.page})`,
        icon: <IconTablerSortDescending2 className='size-17px' />,
        onClick() {
          const u = new URL(location.href)
          u.searchParams.set(SpaceUploadQueryKey.InitialPage, item.page!.toString())
          openNewTab(u.href)
        },
      },
    [SHOW_SPACE_UPLOAD_ONLY, item],
  )

  return useMemo(() => {
    const { watchlaterAdded, hasWatchlaterEntry, onToggleWatchlater } = watchlaterContext
    const divider: AntMenuItem = { type: 'divider' }
    const multiSelectingAppendix = multiSelecting ? ' (多选)' : ''

    const copyMenus = defineAntMenus([
      {
        key: 'copy-link',
        label: `复制视频链接${multiSelectingAppendix}`,
        icon: <IconForCopy className='size-15px' />,
        onClick() {
          if (multiSelectStore.multiSelecting) {
            copyVideoLinks()
          } else {
            onCopyLink()
          }
        },
      },
      {
        test: !!bvid,
        key: 'copy-bvid',
        label: `复制 BVID${multiSelectingAppendix}`,
        icon: <IconForCopy className='size-15px' />,
        onClick() {
          if (multiSelectStore.multiSelecting) {
            copyBvidsSingleLine()
          } else {
            copyContent(bvid!)
          }
        },
      },
      {
        test: !!bvid && settings.__internalEnableCopyBvidInfo,
        key: 'copy-bvid-info',
        label: `复制 BVID 信息${multiSelectingAppendix}`,
        icon: <IconForCopy className='size-15px' />,
        onClick() {
          if (multiSelectStore.multiSelecting) {
            copyBvidInfos()
          } else {
            copyContent(getBvidInfo(cardData))
          }
        },
      },
      {
        test: !!cover,
        key: 'view-cover',
        label: '查看封面',
        icon: <IconForOpenExternalLink className='size-16px' />,
        onClick() {
          if (!cover) return
          const url = cover
          openNewTab(url)
        },
      },
    ])

    // I'm interested in this video or the author
    const interestedMenus = defineAntMenus([
      {
        test: hasViewUpVideoListEntry,
        key: 'view-up-space-upload',
        label: `查看 UP 的投稿`,
        icon: <IconForSpaceUpload className='size-15px' />,
        onClick: onViewUpSpaceUpload,
      },
      // 投稿
      spaceUploadViewStartFromHere,
      {
        test: hasViewUpVideoListEntry && followed,
        key: 'view-up-dyn',
        label: `查看 UP 的动态`,
        icon: <IconForDynamicFeed className='size-15px' />,
        onClick: onViewUpDyn,
      },
      {
        test: hasWatchlaterEntry,
        key: 'watchlater',
        label: watchlaterAdded ? '移除稍后再看' : '稍后再看',
        icon: watchlaterAdded ? <IconForRemove className='size-15px' /> : <IconForWatchlater className='size-15px' />,
        onClick() {
          onToggleWatchlater()
        },
      },
      {
        test: hasWatchlaterEntry && watchlaterAdded,
        key: 'watchlater-readd',
        label: `重新添加稍候再看${tab === ETab.Watchlater ? ' (移到最前)' : ''}`,
        icon: <IconParkOutlineAddTwo className='size-15px' />,
        async onClick() {
          const { success } = await onToggleWatchlater(undefined, watchlaterAdd)
          if (!success) return
          antMessage.success('已重新添加')
          if (tab === ETab.Watchlater) {
            onMoveToFirst?.(item, cardData)
          }
        },
      },

      ...getWatchlaterTabFavMenus(favContext, item, avid),

      // 动态
      dynamicViewUpdateSinceThis,
      dynamicViewStartFromHere,
    ])

    // I don't like this video
    const dislikeMenus = defineAntMenus([
      {
        test: hasDislikeEntry,
        key: 'dislike',
        label: '我不想看',
        icon: <IconForDislike width={15} height={15} />,
        onClick() {
          onTriggerDislike()
        },
      },
      {
        test: hasUnfollowEntry,
        key: 'unfollow-up',
        label: '取消关注',
        icon: <IconParkOutlinePeopleMinus className='size-15px' />,
        onClick: onUnfollowUp,
      },
      {
        test: hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds,
        key: 'hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds',
        label: '在「全部」动态中隐藏 UP 的动态',
        icon: <IconLetsIconsViewHide className='size-15px' />,
        onClick: onAddMidTo_dynamicFeedWhenViewAllHideIds,
      },
      {
        test: hasBlacklistEntry,
        key: 'blacklist-up',
        label: '将 UP 加入黑名单',
        icon: <IconForBlacklist className='size-15px' />,
        onClick: onBlacklistUp,
      },
      {
        test: hasBlacklistEntry,
        key: 'add-up-to-filterlist',
        label: '将 UP 加入过滤列表',
        icon: <IconForBlacklist className='size-15px' />,
        onClick: onAddUpToFilterList,
      },
    ])

    const favTabMenus = getFavTabMenus({ item, cardData, tab, multiSelectingAppendix, onRemoveCurrent })

    return defineAntMenus([
      ...consistentOpenMenus,

      !!copyMenus.length && divider,
      ...copyMenus,

      !!interestedMenus.length && divider,
      ...interestedMenus,

      !!dislikeMenus.length && divider,
      ...dislikeMenus,

      !!favTabMenus.length && divider,
      ...favTabMenus,

      !!conditionalOpenMenus.length && divider,
      ...conditionalOpenMenus,
    ])
  }, [
    item,
    cardData,
    tab,
    // contexts
    watchlaterContext,
    favContext,
    // entries
    hasDislikeEntry,
    hasUnfollowEntry,
    hasBlacklistEntry,
    hasViewUpVideoListEntry,
    hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds,
    // menus
    consistentOpenMenus,
    conditionalOpenMenus,
    // others
    multiSelecting,
  ])
}
