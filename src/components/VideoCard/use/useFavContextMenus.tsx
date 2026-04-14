import { useMemoizedFn } from 'ahooks'
import clsx from 'clsx'
import { assert } from 'es-toolkit'
import { useMemo, useState } from 'react'
import {
  handleModifyFavItemToFolder,
  startModifyFavItemToFolder,
  startPickFavFolder,
} from '$components/ModalFavManager'
import { getMultiSelectedItems } from '$components/RecGrid/rec-grid-state'
import { isFav, type RecItemType } from '$define'
import { EApiType, ETab } from '$enums'
import { antMessage, antModal, defineAntMenus } from '$modules/antd'
import { IconForDelete, IconForEdit, IconForFav, IconForFaved, IconForOpenExternalLink } from '$modules/icon'
import { multiSelectStore } from '$modules/multi-select/store'
import { defaultFavFolderTitle, UserFavApi } from '$modules/rec-services/fav/api'
import { formatFavCollectionSelfSpaceUrl, formatFavFolderUrl } from '$modules/rec-services/fav/fav-url'
import { clearFavFolderAllItemsCache } from '$modules/rec-services/fav/service/fav-folder'
import { FavQueryKey, favStore } from '$modules/rec-services/fav/store'
import toast from '$utility/toast'
import { clsContextMenuIcon } from '../context-menus'
import { getLinkTarget } from './useOpenRelated'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'
import type { IVideoCardData } from '$modules/filter/normalize'

export type FavContext = ReturnType<typeof useInitFavContext>

export function useInitFavContext(item: RecItemType, avid: string | undefined) {
  const [folderNames, setFolderNames] = useState<string[] | undefined>(undefined)
  const [folderUrls, setFolderUrls] = useState<string[] | undefined>(undefined)
  const [folderIds, setFolderIds] = useState<number[] | undefined>(undefined)

  const updateFavFolderNames = useMemoizedFn(async () => {
    if (!avid) return
    // 仅在 [收藏Tab | 提供 quick-fav 的地方] 更新收藏状态
    const { enable: enableQuickFav } = getQuickFavConfig(item.api)
    if (!(enableQuickFav || (isFav(item) && item.from === 'fav-folder'))) return
    const result = await UserFavApi.getVideoFavState(avid)
    if (result) {
      setFolderNames(result.favFolderNames)
      setFolderUrls(result.favFolderUrls)
      setFolderIds(result.favFolderIds)
    }
  })

  return useMemo(
    () => ({ folderNames, folderUrls, folderIds, updateFavFolderNames }),
    [folderNames, folderUrls, folderIds, updateFavFolderNames],
  )
}

function getQuickFavConfig(api: EApiType) {
  const enable = ![EApiType.Separator, EApiType.Live, EApiType.Fav].includes(api) // almost anything
  const enableDetailMenu = api === EApiType.Watchlater || api === EApiType.Liked
  return { enable, enableDetailMenu }
}

// 收藏视频
export function getFavContextMenus(ctx: FavContext, item: RecItemType, avid: string | undefined) {
  if (!avid) return
  const { enable, enableDetailMenu } = getQuickFavConfig(item.api)
  if (!enable) return

  const folderNames = ctx.folderNames ?? []
  const folderUrls = ctx.folderUrls ?? []
  const folderIds = ctx.folderIds ?? []

  const favedMenus = defineAntMenus([
    {
      // 修改收藏夹
      key: 'quick-fav:faved:modify-fav',
      icon: <IconForFaved className={clsx(clsContextMenuIcon, 'color-gate-primary')} />,
      label: `已收藏在 ${(folderNames || []).map((n) => `「${n}」`).join('')}`,
      async onClick() {
        assert(folderIds.length, 'folderIds.length should not be empty')
        await startModifyFavItemToFolder(folderIds, (targetFolder) => {
          return handleModifyFavItemToFolder(avid, folderIds, targetFolder)
        })
      },
    },
    enableDetailMenu && {
      // 浏览收藏夹
      key: 'quick-fav:faved:browse-fav-folder-in-self-space',
      icon: <IconForOpenExternalLink className={clsContextMenuIcon} />,
      label: '去个人空间查看收藏夹',
      onClick() {
        folderUrls.forEach((u) => {
          window.open(u, getLinkTarget())
        })
      },
    },
  ])
  const unfavedMenus = defineAntMenus([
    {
      // 收藏
      key: 'quick-fav:unfaved:add-fav',
      icon: <IconForFav className={clsContextMenuIcon} />,
      label: '收藏到',
      async onClick() {
        await startPickFavFolder(async (targetFolder) => {
          const result = await UserFavApi.addFav(avid, targetFolder.id)
          if (result.isOk()) antMessage.success(`已加入收藏夹「${targetFolder.title}」`)
          return result.isOk()
        })
      },
    },
    {
      // 快速收藏
      test: enableDetailMenu,
      key: 'quick-fav:unfaved:add-fav-to-default-folder',
      icon: <IconForFav className={clsContextMenuIcon} />,
      label: '收藏到「默认收藏夹」',
      async onClick() {
        const result = await UserFavApi.addFav(avid)
        if (result.isOk()) return antMessage.success(`已加入收藏夹「${defaultFavFolderTitle}」`)
        antMessage.error(typeof result.error === 'string' ? result.error : result.error.message)
      },
    },
  ])

  const faved = !!folderNames.length
  return faved ? favedMenus : unfavedMenus
}

// 收藏 Tab 的收藏菜单
export function getFavTabFavRelatedMenus({
  ctx,
  item,
  cardData,
  tab,
  multiSelecting,
  multiSelectingAppendix,
  onRemoveCurrent,
  recSharedEmitter,
}: {
  ctx: FavContext
  item: RecItemType
  cardData: IVideoCardData
  tab: ETab
  multiSelecting: boolean | undefined
  multiSelectingAppendix: string
  onRemoveCurrent: ((item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>) | undefined
  recSharedEmitter: RecSharedEmitter
}) {
  if (!isFav(item)) return []

  const { avid } = cardData
  const folderNames = ctx.folderNames ?? []
  const folderUrls = ctx.folderUrls ?? []
  const folderIds = ctx.folderIds ?? []

  // 收藏夹
  if (item.from === 'fav-folder') {
    const batchMenus = multiSelecting
      ? [
          {
            key: 'fav:batch-move-fav',
            label: `移动到其他收藏夹${multiSelectingAppendix}`,
            icon: <IconParkOutlineTransferData className={clsContextMenuIcon} />,
            async onClick() {
              if (!multiSelectStore.multiSelecting) return

              const selectedFavItems = getMultiSelectedItems()
                .filter((x) => isFav(x) && x.from === 'fav-folder')
                .toReversed() // gui first item as queue last, keep first in target folder
              const folderIds = new Set(selectedFavItems.map((i) => i.folder.id))
              if (!folderIds.size) return toast('至少选择一项视频')
              if (folderIds.size > 1) return toast('多选移动: 只能批量移动同一源收藏夹下的视频')

              const srcFavFolderId = selectedFavItems[0].folder.id
              const resources = selectedFavItems.map((x) => `${x.id}:${x.type}`)
              const uniqIds = selectedFavItems.map((x) => x.uniqId)
              const titles = selectedFavItems.map((x) => x.title)

              await startModifyFavItemToFolder(
                [item.folder.id],
                async (targetFolder) => {
                  assert(targetFolder, 'targetFolder should not be empty')
                  const result = await UserFavApi.moveFavs(resources, srcFavFolderId, targetFolder.id)
                  if (result.isErr()) {
                    antMessage.error(result.error.message)
                    return false
                  }

                  clearFavFolderAllItemsCache(item.folder.id)
                  clearFavFolderAllItemsCache(targetFolder.id)
                  recSharedEmitter.emit('remove-cards', [uniqIds, titles, true])
                  antMessage.success(`已移动 ${uniqIds.length} 个视频到「${targetFolder.title}」收藏夹`)
                  return true
                },
                false,
              )
            },
          },
        ]
      : []

    return defineAntMenus([
      {
        key: 'fav:browse-fav-folder-in-self-space',
        label: '去个人空间查看收藏夹',
        icon: <IconForOpenExternalLink className={clsContextMenuIcon} />,
        onClick() {
          const { id } = item.folder
          const url = formatFavFolderUrl(id)
          window.open(url, getLinkTarget())
        },
      },
      {
        key: 'fav:view-fav-in-new-window',
        label: '在新窗口中查看收藏夹',
        icon: <IconForOpenExternalLink className={clsContextMenuIcon} />,
        onClick() {
          const { id } = item.folder
          const url = `/?${FavQueryKey.FolderIdFull}=${id}`
          window.open(url, getLinkTarget())
        },
      },
      {
        test: !!avid,
        key: 'modify-fav',
        icon: <IconForEdit className={clsContextMenuIcon} />,
        label: '编辑收藏',
        async onClick() {
          await startModifyFavItemToFolder(
            folderIds,
            async (targetFolder) => {
              const success = await handleModifyFavItemToFolder(avid!, folderIds, targetFolder)
              if (success && targetFolder?.id !== item.folder.id) onRemoveCurrent?.(item, cardData, true)
              return success
            },
            false,
          )
        },
      },
      {
        key: 'remove-fav',
        label: '移除收藏',
        icon: <IconForDelete className={clsContextMenuIcon} />,
        async onClick() {
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
          const result = await UserFavApi.removeFavs(item.folder.id, resource)
          if (result.isErr()) {
            return antMessage.error(result.error.message)
          }

          clearFavFolderAllItemsCache(item.folder.id)
          onRemoveCurrent?.(item, cardData)
        },
      },
      ...batchMenus,
    ])
  }

  // 合集
  if (item.from === 'fav-collection') {
    return defineAntMenus([
      {
        key: 'open-fav-collection',
        label: '浏览合集',
        icon: <IconForOpenExternalLink className={clsContextMenuIcon} />,
        onClick() {
          const { id } = item.collection
          const url =
            tab !== ETab.Fav || (favStore.selectedKey === 'all' && favStore.usingShuffle)
              ? `/?${FavQueryKey.CollectionIdFull}=${id}`
              : formatFavCollectionSelfSpaceUrl(id)
          window.open(url, getLinkTarget())
        },
      },
    ])
  }

  // unexpected
  return []
}
