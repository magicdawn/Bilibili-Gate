/**
 * context menus related
 */

import { useMemoizedFn } from 'ahooks'
import { isNil } from 'es-toolkit'
import { useMemo, type MouseEvent } from 'react'
import { useSnapshot } from 'valtio'
import {
  copyBvidInfos,
  copyBvidsSingleLine,
  copyVideoLinks,
  getBvidInfo,
  getCurrentGridItems,
} from '$components/RecGrid/rec-grid-state'
import { ETab } from '$components/RecHeader/tab-enum'
import { useRecSelfContext } from '$components/Recommends/rec.shared'
import {
  isAppRecommend,
  isDynamicFeed,
  isLive,
  isPcRecommend,
  isSpaceUpload,
  type DynamicFeedItemExtend,
  type RecItemType,
} from '$define'
import { EApiType } from '$define/index.shared'
import { antMessage, antModal, defineAntMenus, type AntMenuItem } from '$modules/antd'
import { UserBlacklistService } from '$modules/bilibili/me/relations/blacklist'
import { UserfollowService } from '$modules/bilibili/me/relations/follow'
import { setNicknameCache } from '$modules/bilibili/user/nickname'
import { getFollowedStatus, isApiRecLike } from '$modules/filter'
import { openNewTab } from '$modules/gm'
import {
  IconForAsc,
  IconForBlacklist,
  IconForCopy,
  IconForDelete,
  IconForDesc,
  IconForDislike,
  IconForDynamicFeed,
  IconForOpenExternalLink,
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
import { copyContent } from './index.shared'
import { watchlaterAdd } from './services'
import { getFavTabMenus, getWatchlaterTabFavMenus, type FavContext } from './use/useFavRelated'
import type { IVideoCardData } from '$modules/filter/normalize'
import type { WatchlaterRelatedContext } from './use/useWatchlaterRelated'

export const clsContextMenuIcon = 'size-16px' // icon 可能看起来不一样大, 但文字对不齐的体验更差, 所以还是优先文字对齐

type UseContextMenuOptions = {
  item: RecItemType
  cardData: IVideoCardData
  tab: ETab
  isNormalVideo: boolean
  multiSelecting?: boolean

  watchlaterContext: WatchlaterRelatedContext
  favContext: FavContext
  hasDislikeEntry: boolean
  onTriggerDislike: () => unknown

  onMoveToFirst: ((item: RecItemType, data: IVideoCardData) => void | Promise<void>) | undefined
  onRemoveCurrent: ((item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>) | undefined

  consistentOpenMenus: AntMenuItem[]
  conditionalOpenMenus: AntMenuItem[]
}

export function useContextMenus(options: UseContextMenuOptions): AntMenuItem[] {
  const {
    item,
    cardData,
    tab,
    isNormalVideo,

    favContext,
    watchlaterContext,
    hasDislikeEntry,
    onTriggerDislike,

    onMoveToFirst,
    onRemoveCurrent,

    consistentOpenMenus,
    conditionalOpenMenus,

    multiSelecting,
  } = options

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
  const { recSharedEmitter } = useRecSelfContext()

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
    antMessage.success(`已加入过滤名单: ${authorName || authorMid}`)
  })

  /**
   * unfollow
   */
  const followed = (() => {
    if (!isNil(cardData.followed)) return cardData.followed
    if (tab === ETab.DynamicFeed && isLive(item)) return true // 关注的人的直播; ETab.DynamicFeed 其他 item 使用 cardData.followed
    if (tab === ETab.Live && isLive(item)) return true // 关注的人的直播
    if (isAppRecommend(item) || isPcRecommend(item)) return getFollowedStatus(recommendReason)
    return false
  })()
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
  // before 2026-01-25 15:32:51, has a prefix `(isNormalVideo || isLive(item))`
  const hasViewUpVideoListEntry = !!authorMid && !!authorName
  const onViewUpDyn = useMemoizedFn(() => {
    if (!authorMid) return
    openNewTab(`/?${DynamicFeedQueryKey.Mid}=${authorMid}`)
  })
  const onViewUpSpaceUpload = useMemoizedFn(() => {
    if (!authorMid) return
    openNewTab(`/?${SpaceUploadQueryKey.Mid}=${authorMid}`)
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
        icon: <IconForDesc className={clsContextMenuIcon} />,
        onClick() {
          const u = new URL('/', location.href)
          u.searchParams.set(DynamicFeedQueryKey.Mid, authorMid)
          const currentIndexInGrid = getCurrentGridItems().findIndex(
            (x) => x.api === EApiType.DynamicFeed && x.id_str === item.id_str,
          )
          const prevIdStr =
            (getCurrentGridItems()[currentIndexInGrid - 1] as DynamicFeedItemExtend | undefined)?.id_str || item.id_str // 上一项的 id_str
          u.searchParams.set(DynamicFeedQueryKey.Offset, prevIdStr)
          openNewTab(u.href)
        },
      },
    [hasEntry_dynamicFeed_offsetAndMinId, item],
  )
  const dynamicViewUpdateSinceThis: AntMenuItem | false = useMemo(
    () =>
      hasEntry_dynamicFeed_offsetAndMinId && {
        icon: <IconForAsc className={clsContextMenuIcon} />,
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
        label: `投稿: 从此页开始查看 (当前第${item.page}页)`,
        icon: <IconForDesc className={clsContextMenuIcon} />,
        onClick() {
          const u = new URL(location.href)
          u.searchParams.set(SpaceUploadQueryKey.InitialPage, item.page!.toString())
          openNewTab(u.href)
        },
      },
    [SHOW_SPACE_UPLOAD_ONLY, item],
  )

  const viewingGroupId = isDynamicFeed(item) || isSpaceUpload(item) ? item.groupId : undefined
  const viewingSomeGroup = viewingGroupId !== undefined
  const followGroups = useSnapshot(dfStore.groups)
  const viewingGroup = viewingGroupId !== undefined ? followGroups.find((x) => x.tagid === viewingGroupId) : undefined
  const viewingGroupName = viewingGroup?.name
  const viewingGroupCount = viewingGroup?.count

  return useMemo(() => {
    const { watchlaterAdded, hasWatchlaterEntry, onToggleWatchlater } = watchlaterContext
    const divider: AntMenuItem = { type: 'divider' }
    const multiSelectingAppendix = multiSelecting ? ' (多选)' : ''

    const copyMenus = defineAntMenus([
      {
        key: 'copy-link',
        label: `复制视频链接${multiSelectingAppendix}`,
        icon: <IconForCopy className={clsContextMenuIcon} />,
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
        icon: <IconForCopy className={clsContextMenuIcon} />,
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
        icon: <IconForCopy className={clsContextMenuIcon} />,
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
        icon: <IconForOpenExternalLink className={clsContextMenuIcon} />,
        onClick() {
          if (!cover) return
          const url = cover
          openNewTab(url)
        },
      },
    ])

    // I'm interested in this video or the author
    const interestedMenus = defineAntMenus([
      // [投稿,动态]
      {
        test: hasViewUpVideoListEntry && followed, // has both entry
        key: `查看「投稿」与「动态」的区别`,
        label: `查看「投稿」与「动态」的区别`,
        icon: <IconForOpenExternalLink className={clsContextMenuIcon} />,
        onClick: () =>
          openNewTab(
            'https://github.com/magicdawn/Bilibili-Gate?tab=readme-ov-file#%E5%8F%B3%E9%94%AE%E8%8F%9C%E5%8D%95-%E6%9F%A5%E7%9C%8B-up-%E7%9A%84%E6%8A%95%E7%A8%BF--%E6%9F%A5%E7%9C%8B-up-%E7%9A%84%E5%8A%A8%E6%80%81',
          ),
      },
      {
        test: hasViewUpVideoListEntry,
        key: '查看 UP 的投稿',
        label: `查看 UP 的投稿`,
        icon: <IconForSpaceUpload className={clsContextMenuIcon} />,
        onClick: onViewUpSpaceUpload,
      },
      spaceUploadViewStartFromHere,

      // 动态
      {
        test: hasViewUpVideoListEntry && followed,
        key: '查看 UP 的动态',
        label: `查看 UP 的动态`,
        icon: <IconForDynamicFeed className={clsContextMenuIcon} />,
        onClick: onViewUpDyn,
      },
      dynamicViewUpdateSinceThis,
      dynamicViewStartFromHere,

      ...(hasViewUpVideoListEntry && viewingSomeGroup
        ? defineAntMenus([
            { type: 'divider' },
            {
              test:
                hasViewUpVideoListEntry &&
                viewingSomeGroup &&
                (viewingGroupCount === undefined || viewingGroupCount <= 30),
              key: '查看分组的投稿',
              label: `查看分组的投稿`,
              icon: <IconForSpaceUpload className={clsContextMenuIcon} />,
              onClick: () => openNewTab(`/?${SpaceUploadQueryKey.GroupId}=${viewingGroupId}`),
            },
            {
              test: hasViewUpVideoListEntry && viewingSomeGroup,
              key: '查看分组的动态',
              label: `查看分组的动态`,
              icon: <IconForDynamicFeed className={clsContextMenuIcon} />,
              onClick: () => openNewTab(`/?${DynamicFeedQueryKey.GroupId}=${viewingGroupId}`),
            },
            { type: 'divider' },
          ])
        : []),

      // 稍后再看
      {
        test: hasWatchlaterEntry,
        key: 'watchlater',
        label: watchlaterAdded ? '移除稍后再看' : '稍后再看',
        icon: watchlaterAdded ? (
          <IconForDelete className={clsContextMenuIcon} />
        ) : (
          <IconForWatchlater className={clsContextMenuIcon} />
        ),
        onClick() {
          onToggleWatchlater()
        },
      },
      {
        test: hasWatchlaterEntry && watchlaterAdded,
        key: 'watchlater-readd',
        label: `重新添加稍候再看${tab === ETab.Watchlater ? ' (移到最前)' : ''}`,
        icon: <IconParkOutlineAddTwo className={clsContextMenuIcon} />,
        async onClick() {
          const { success } = await onToggleWatchlater(undefined, watchlaterAdd)
          if (!success) return
          antMessage.success('已重新添加')
          if (tab === ETab.Watchlater) {
            onMoveToFirst?.(item, cardData)
          }
        },
      },
      // 稍后再看 Tab 的收藏相关
      ...getWatchlaterTabFavMenus(favContext, item, avid),
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
        icon: <IconParkOutlinePeopleMinus className={clsContextMenuIcon} />,
        onClick: onUnfollowUp,
      },
      {
        test: hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds,
        key: 'hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds',
        label: '在「全部」动态中隐藏 UP 的动态',
        icon: <IconLetsIconsViewHide className={clsContextMenuIcon} />,
        onClick: onAddMidTo_dynamicFeedWhenViewAllHideIds,
      },
      {
        test: hasBlacklistEntry,
        key: 'blacklist-up',
        label: '将 UP 加入黑名单',
        icon: <IconForBlacklist className={clsContextMenuIcon} />,
        onClick: onBlacklistUp,
      },
      {
        test: hasBlacklistEntry,
        key: 'add-up-to-filterlist',
        label: '将 UP 加入过滤列表',
        icon: <IconForBlacklist className={clsContextMenuIcon} />,
        onClick: onAddUpToFilterList,
      },
    ])

    const favTabMenus = getFavTabMenus({
      ctx: favContext,
      item,
      cardData,
      tab,
      multiSelecting,
      multiSelectingAppendix,
      onRemoveCurrent,
      recSharedEmitter,
    })

    const menus = defineAntMenus([
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

    return menus
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
    viewingGroupId,
    viewingSomeGroup,
    viewingGroupName,
    viewingGroupCount,
  ])
}

/**
 * @returns true: event handled, false: continue your logic
 */
export function showNativeContextMenuWhenAltKeyPressed(e: MouseEvent): boolean | undefined {
  // if alt is pressed, show native context menu
  if (e.altKey) {
    e.stopPropagation()
    return true
  }
}
