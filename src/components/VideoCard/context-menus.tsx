/**
 * context menus related
 */

import { appClsColorPrimary } from '$common/css-vars-export.module.scss'
import { currentGridItems, getBvidInfo } from '$components/RecGrid/unsafe-window-export'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { ETab } from '$components/RecHeader/tab-enum'
import {
  isDynamicFeed,
  isFav,
  isLive,
  isWatchlater,
  type DynamicFeedItemExtend,
  type RecItemType,
} from '$define'
import { EApiType } from '$define/index.shared'
import { antMessage, defineAntMenus, type AntMenuItem } from '$modules/antd'
import { UserBlacklistService } from '$modules/bilibili/me/relations/blacklist'
import { UserfollowService } from '$modules/bilibili/me/relations/follow'
import { setNicknameCache } from '$modules/bilibili/user/nickname'
import { openNewTab } from '$modules/gm'
import {
  IconForBlacklist,
  IconForCopy,
  IconForDislike,
  IconForDynamicFeed,
  IconForFav,
  IconForFaved,
  IconForOpenExternalLink,
  IconForSpaceUpload,
  IconForWatchlater,
} from '$modules/icon'
import {
  DF_SELECTED_KEY_ALL,
  DF_SELECTED_KEY_PREFIX_UP,
  DynamicFeedQueryKey,
  QUERY_DYNAMIC_UP_MID,
  dfStore,
} from '$modules/rec-services/dynamic-feed/store'
import { formatFavCollectionUrl, formatFavFolderUrl } from '$modules/rec-services/fav/fav-url'
import { FavQueryKey, favStore } from '$modules/rec-services/fav/store'
import { UserFavService, defaultFavFolderName } from '$modules/rec-services/fav/user-fav-service'
import { SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'
import { settings, updateSettingsInnerArray } from '$modules/settings'
import toast from '$utility/toast'
import { delay } from 'es-toolkit'
import type { MouseEvent } from 'react'
import { useSnapshot } from 'valtio'
import { copyContent } from './index.shared'
import { getFollowedStatus, isApiRecLike } from './process/filter'
import type { IVideoCardData } from './process/normalize'
import type { watchlaterDel } from './services'
import { watchlaterAdd } from './services'
import { getLinkTarget } from './use/useOpenRelated'

export function useContextMenus({
  item,
  cardData,
  tab,

  href,
  authorMid,
  authorName,
  recommendReason,
  isNormalVideo,
  onRefresh,
  watchlaterAdded,
  bvid,
  hasWatchlaterEntry,
  onToggleWatchlater,
  favFolderNames,
  avid,
  favFolderUrls,
  onMoveToFirst,
  hasDislikeEntry,
  onTriggerDislike,
  onRemoveCurrent,
  consistentOpenMenus,
  conditionalOpenMenus,
}: {
  item: RecItemType
  cardData: IVideoCardData
  tab: ETab

  href: string
  authorMid: string | undefined
  authorName: string | undefined
  recommendReason: string | undefined
  isNormalVideo: boolean
  onRefresh: OnRefresh | undefined
  watchlaterAdded: boolean
  bvid: string | undefined
  hasWatchlaterEntry: boolean
  onToggleWatchlater: (
    e?: MouseEvent,
    usingAction?: typeof watchlaterDel | typeof watchlaterAdd,
  ) => Promise<{
    success: boolean
    targetState?: boolean
  }>
  favFolderNames: string[] | undefined
  avid: string | undefined
  favFolderUrls: string[] | undefined
  onMoveToFirst: ((item: RecItemType, data: IVideoCardData) => void | Promise<void>) | undefined
  hasDislikeEntry: boolean
  onTriggerDislike: () => unknown
  onRemoveCurrent: ((item: RecItemType, data: IVideoCardData) => void | Promise<void>) | undefined
  consistentOpenMenus: AntMenuItem[]
  conditionalOpenMenus: AntMenuItem[]
}): AntMenuItem[] {
  const { cover } = cardData

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
    ((item.api === EApiType.AppRecommend || item.api === EApiType.PcRecommend) &&
      getFollowedStatus(recommendReason))
  const hasUnfollowEntry = followed
  const onUnfollowUp = useMemoizedFn(async () => {
    if (!authorMid) return
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
    enableHideSomeContents &&
    isDynamicFeed(item) &&
    dfStore.selectedKey === DF_SELECTED_KEY_ALL &&
    !!authorMid
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
            (currentGridItems[currentIndexInGrid - 1] as DynamicFeedItemExtend | undefined)
              ?.id_str || item.id_str // 上一项的 id_str
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

  return useMemo(() => {
    const divider: AntMenuItem = { type: 'divider' }

    const copyMenus = defineAntMenus([
      {
        key: 'copy-link',
        label: '复制视频链接',
        icon: <IconForCopy className='size-15px' />,
        onClick: onCopyLink,
      },
      {
        test: !!bvid,
        key: 'copy-bvid',
        label: '复制 BVID',
        icon: <IconForCopy className='size-15px' />,
        onClick() {
          copyContent(bvid!)
        },
      },
      {
        test: !!bvid && settings.__internalEnableCopyBvidInfoContextMenu,
        key: 'copy-bvid-info',
        label: '复制 BVID 信息',
        icon: <IconForCopy className='size-15px' />,
        onClick() {
          copyContent(getBvidInfo(cardData))
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

    // I'm interested in this video and video-author
    const interestedMenus = defineAntMenus([
      {
        test: hasViewUpVideoListEntry,
        key: 'view-up-space-upload',
        label: `查看 UP 的投稿`,
        icon: <IconForSpaceUpload className='size-15px' />,
        onClick: onViewUpSpaceUpload,
      },
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
        icon: watchlaterAdded ? (
          <IconMaterialSymbolsDeleteOutlineRounded className='size-15px' />
        ) : (
          <IconForWatchlater className='size-15px' />
        ),
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
      {
        test: isWatchlater(item),
        key: 'add-fav',
        icon: favFolderNames?.length ? (
          <IconForFaved className={clsx('size-15px', appClsColorPrimary)} />
        ) : (
          <IconForFav className='size-15px' />
        ),
        label: favFolderNames?.length
          ? `已收藏 ${favFolderNames.map((n) => `「${n}」`).join('')}`
          : '快速收藏',
        async onClick() {
          if (!avid) return

          const hasFaved = Boolean(favFolderNames?.length)

          // 浏览收藏夹
          if (hasFaved) {
            favFolderUrls?.forEach((u) => {
              window.open(u, getLinkTarget())
            })
          }

          // 快速收藏
          else {
            const success = await UserFavService.addFav(avid)
            if (success) {
              antMessage.success(`已加入收藏夹「${defaultFavFolderName}」`)
            }
          }
        },
      },

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
        icon: <IconForBlacklist className='size-15' />,
        onClick: onBlacklistUp,
      },
      {
        test: hasBlacklistEntry,
        key: 'add-up-to-filterlist',
        label: '将 UP 加入过滤列表',
        icon: <IconForBlacklist className='size-15' />,
        onClick: onAddUpToFilterList,
      },
    ])

    const favMenus = !isFav(item)
      ? []
      : defineAntMenus([
          // 收藏夹
          ...(item.from === 'fav-folder'
            ? [
                {
                  key: 'open-fav-folder',
                  label: '浏览收藏夹',
                  icon: <IconForOpenExternalLink className='size-15px' />,
                  onClick() {
                    if (!isFav(item)) return
                    const { id } = item.folder
                    const url =
                      tab !== ETab.Fav || (favStore.selectedKey === 'all' && favStore.usingShuffle)
                        ? `/?${FavQueryKey.FolderIdFull}=${id}`
                        : formatFavFolderUrl(id)
                    window.open(url, getLinkTarget())
                  },
                },
                {
                  key: 'remove-fav',
                  label: '移除收藏',
                  icon: <IconMaterialSymbolsDeleteOutlineRounded className='size-15px' />,
                  async onClick() {
                    if (!isFav(item)) return
                    const success = await UserFavService.removeFav(
                      item.folder.id,
                      `${item.id}:${item.type}`,
                    )
                    if (success) {
                      await delay(1000)
                      onRemoveCurrent?.(item, cardData)
                    }
                  },
                },
              ]
            : []),

          // 合集
          ...(item.from === 'fav-collection'
            ? [
                {
                  key: 'open-fav-collection',
                  label: '浏览合集',
                  icon: <IconForOpenExternalLink className='size-15px' />,
                  onClick() {
                    if (!isFav(item)) return
                    const { id } = item.collection
                    const url =
                      tab !== ETab.Fav || (favStore.selectedKey === 'all' && favStore.usingShuffle)
                        ? `/?${FavQueryKey.CollectionIdFull}=${id}`
                        : formatFavCollectionUrl(id)
                    window.open(url, getLinkTarget())
                  },
                },
              ]
            : []),
        ])

    return defineAntMenus([
      ...consistentOpenMenus,

      !!copyMenus.length && divider,
      ...copyMenus,

      !!interestedMenus.length && divider,
      ...interestedMenus,

      !!dislikeMenus.length && divider,
      ...dislikeMenus,

      !!favMenus.length && divider,
      ...favMenus,

      !!conditionalOpenMenus.length && divider,
      ...conditionalOpenMenus,
    ])
  }, [
    item,
    cardData,
    tab,
    // entries
    hasWatchlaterEntry,
    watchlaterAdded,
    hasDislikeEntry,
    hasUnfollowEntry,
    hasBlacklistEntry,
    hasViewUpVideoListEntry,
    hasEntry_addMidTo_dynamicFeedWhenViewAllHideIds,
    // others
    favFolderNames,
    favFolderUrls,
    consistentOpenMenus,
    conditionalOpenMenus,
  ])
}
