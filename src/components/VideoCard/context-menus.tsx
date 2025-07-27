/**
 * context menus related
 */

import { useSnapshot } from 'valtio'
import { pickFavFolder } from '$components/ModalMoveFav'
import {
  copyBvidInfos,
  copyBvidsSingleLine,
  copyVideoLinks,
  currentGridItems,
  currentGridSharedEmitter,
  getBvidInfo,
  getMultiSelectedItems,
} from '$components/RecGrid/unsafe-window-export'
import { ETab } from '$components/RecHeader/tab-enum'
import {
  isDynamicFeed,
  isFav,
  isLive,
  isSpaceUpload,
  isWatchlater,
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
  IconForBlacklist,
  IconForCopy,
  IconForDislike,
  IconForDynamicFeed,
  IconForFav,
  IconForFaved,
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
import { formatFavCollectionUrl, formatFavFolderUrl } from '$modules/rec-services/fav/fav-url'
import { clearFavFolderAllItemsCache } from '$modules/rec-services/fav/service/fav-folder'
import { FavQueryKey, favStore } from '$modules/rec-services/fav/store'
import { defaultFavFolderTitle, UserFavService } from '$modules/rec-services/fav/user-fav-service'
import { SHOW_SPACE_UPLOAD_ONLY, SpaceUploadQueryKey } from '$modules/rec-services/space-upload/store'
import { settings, updateSettingsInnerArray } from '$modules/settings'
import toast from '$utility/toast'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import type { IVideoCardData } from '$modules/filter/normalize'
import { copyContent } from './index.shared'
import { watchlaterAdd } from './services'
import { getLinkTarget } from './use/useOpenRelated'
import type { watchlaterDel } from './services'
import type { MouseEvent } from 'react'

export function useContextMenus({
  item,
  cardData,
  tab,

  isNormalVideo,
  onRefresh,

  watchlaterAdded,
  hasWatchlaterEntry,
  onToggleWatchlater,

  hasDislikeEntry,
  onTriggerDislike,

  favFolderNames,
  favFolderUrls,

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

  watchlaterAdded: boolean
  hasWatchlaterEntry: boolean
  onToggleWatchlater: (
    e?: MouseEvent,
    usingAction?: typeof watchlaterDel | typeof watchlaterAdd,
  ) => Promise<{
    success: boolean
    targetState?: boolean
  }>

  favFolderNames: string[] | undefined
  favFolderUrls: string[] | undefined

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
      {
        // 浏览收藏夹
        test: isWatchlater(item) && !!favFolderNames?.length,
        key: 'watchlater-faved:browse-fav-folder',
        icon: <IconForFaved className='size-15px color-gate-primary' />,
        label: `已收藏在 ${(favFolderNames || []).map((n) => `「${n}」`).join('')}`,
        onClick() {
          if (!avid) return
          favFolderUrls?.forEach((u) => {
            window.open(u, getLinkTarget())
          })
        },
      },
      {
        // 快速收藏
        test: isWatchlater(item) && !favFolderNames?.length,
        key: 'watchlater:add-quick-fav',
        icon: <IconForFav className='size-15px' />,
        label: '收藏到「默认收藏夹」',
        async onClick() {
          if (!avid) return
          const success = await UserFavService.addFav(avid)
          if (success) {
            antMessage.success(`已加入收藏夹「${defaultFavFolderTitle}」`)
          }
        },
      },
      {
        // 收藏
        test: isWatchlater(item) && !favFolderNames?.length,
        key: 'watchlater:add-fav',
        icon: <IconForFav className='size-15px' />,
        label: '收藏到',
        async onClick() {
          if (!avid) return
          await pickFavFolder(undefined, async (targetFolder) => {
            const success = await UserFavService.addFav(avid, targetFolder.id)
            if (success) antMessage.success(`已加入收藏夹「${targetFolder.title}」`)
            return success
          })
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
                  key: 'move-fav',
                  label: `移动到其他收藏夹${multiSelectingAppendix}`,
                  icon: <IconParkOutlineTransferData className='size-13px' />,
                  async onClick() {
                    let resources: string | string[]
                    let srcFavFolderId: number
                    let uniqIds: string[]
                    let titles: string[]
                    if (multiSelectStore.multiSelecting) {
                      const selectedFavItems = getMultiSelectedItems().filter(
                        (x) => isFav(x) && x.from === 'fav-folder',
                      )
                      const folderIds = new Set(selectedFavItems.map((i) => i.folder.id))
                      if (!folderIds.size) {
                        return toast('至少选择一项视频')
                      }
                      if (folderIds.size > 1) {
                        return toast('多选移动: 只能批量移动同一源收藏夹下的视频')
                      }
                      srcFavFolderId = selectedFavItems[0].folder.id
                      resources = selectedFavItems.map((x) => `${x.id}:${x.type}`)
                      uniqIds = selectedFavItems.map((x) => x.uniqId)
                      titles = selectedFavItems.map((x) => x.title)
                    } else {
                      resources = `${item.id}:${item.type}`
                      srcFavFolderId = item.folder.id
                      uniqIds = [item.uniqId]
                      titles = [item.title]
                    }

                    await pickFavFolder(item.folder.id, async (targetFolder) => {
                      const success = await UserFavService.moveFavs(resources, srcFavFolderId, targetFolder.id)
                      if (!success) return
                      clearFavFolderAllItemsCache(item.folder.id)
                      clearFavFolderAllItemsCache(targetFolder.id)
                      currentGridSharedEmitter.emit('remove-cards', [uniqIds, titles, true])
                      antMessage.success(`已移动 ${uniqIds.length} 个视频到「${targetFolder.title}」收藏夹`)
                      return success
                    })
                  },
                },
                {
                  key: 'remove-fav',
                  label: '移除收藏',
                  icon: <IconMaterialSymbolsDeleteOutlineRounded className='size-15px' />,
                  async onClick() {
                    if (!isFav(item)) return

                    // 经常误操作, 点到这项, 直接移除了...
                    const confirm = await antModal.confirm({
                      centered: true,
                      title: '移除收藏',
                      content: (
                        <>
                          确定将视频「{item.title}」<br />
                          从收藏夹「{item.folder.title}」中移除?
                        </>
                      ),
                    })
                    if (!confirm) return

                    const resource = `${item.id}:${item.type}`
                    const success = await UserFavService.removeFavs(item.folder.id, resource)
                    if (!success) return

                    clearFavFolderAllItemsCache(item.folder.id)
                    onRemoveCurrent?.(item, cardData)
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
    //
    multiSelecting,
  ])
}
