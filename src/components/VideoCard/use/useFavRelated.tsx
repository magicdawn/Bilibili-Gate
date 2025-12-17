import { pickFavFolder } from '$components/ModalMoveFav'
import { getMultiSelectedItems } from '$components/RecGrid/rec-grid-state'
import { ETab } from '$components/RecHeader/tab-enum'
import { isFav, isWatchlater, type RecItemType } from '$define'
import { antMessage, antModal, defineAntMenus } from '$modules/antd'
import { IconForFav, IconForFaved, IconForOpenExternalLink } from '$modules/icon'
import { multiSelectStore } from '$modules/multi-select/store'
import { formatFavCollectionUrl, formatFavFolderUrl } from '$modules/rec-services/fav/fav-url'
import { clearFavFolderAllItemsCache } from '$modules/rec-services/fav/service/fav-folder'
import { FavQueryKey, favStore } from '$modules/rec-services/fav/store'
import { defaultFavFolderTitle, UserFavService } from '$modules/rec-services/fav/user-fav-service'
import toast from '$utility/toast'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'
import type { IVideoCardData } from '$modules/filter/normalize'
import { getLinkTarget } from './useOpenRelated'

export type FavContext = ReturnType<typeof useInitFavContext>

export function useInitFavContext(item: RecItemType, avid: string | undefined) {
  const [folderNames, setFolderNames] = useState<string[] | undefined>(undefined)
  const [folderUrls, setFolderUrls] = useState<string[] | undefined>(undefined)
  const [folderIds, setFolderIds] = useState<number[] | undefined>(undefined)

  const updateFavFolderNames = useMemoizedFn(async () => {
    // 只在「稍后再看」提供收藏状态
    if (item.api !== 'watchlater') return
    if (!avid) return
    const result = await UserFavService.getVideoFavState(avid)
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

export function getWatchlaterTabFavMenus(ctx: FavContext, item: RecItemType, avid: string | undefined) {
  if (!isWatchlater(item) || !avid) return []
  const folderNames = ctx.folderNames ?? []
  const folderUrls = ctx.folderUrls ?? []
  const folderIds = ctx.folderIds ?? []

  const favedMenus = defineAntMenus([
    {
      // 浏览收藏夹
      key: 'watchlater-faved:browse-fav-folder',
      icon: <IconForFaved className='size-15px color-gate-primary' />,
      label: `已收藏在 ${(folderNames || []).map((n) => `「${n}」`).join('')}`,
      onClick() {
        folderUrls.forEach((u) => {
          window.open(u, getLinkTarget())
        })
      },
    },
    {
      // 浏览收藏夹
      key: 'watchlater-faved:move-fav',
      icon: <IconParkOutlineTransferData className='size-13px' />,
      label: '移动到其他收藏夹',
      async onClick() {
        const resource = `${avid}:2`
        const srcFavFolderId = folderIds[0]

        if (folderIds.length > 1) {
          const otherFolderIds = folderIds.slice(1)
          const otherFolderNames = folderNames.slice(1)
          for (const [index, fid] of otherFolderIds.entries()) {
            const success = await UserFavService.removeFavs(fid, resource)
            if (!success) {
              const fname = otherFolderNames[index]
              antMessage.warning(`从收藏夹「${fname}」移除失败!`)
            }
          }
        }

        await pickFavFolder(srcFavFolderId, async (targetFolder) => {
          const success = await UserFavService.moveFavs(resource, srcFavFolderId, targetFolder.id)
          if (!success) return
          clearFavFolderAllItemsCache(srcFavFolderId)
          clearFavFolderAllItemsCache(targetFolder.id)
          antMessage.success(`已移动到「${targetFolder.title}」收藏夹`)
          return success
        })
      },
    },
  ])

  const unfavedMenus = defineAntMenus([
    {
      // 快速收藏
      key: 'watchlater:add-quick-fav',
      icon: <IconForFav className='size-15px' />,
      label: '收藏到「默认收藏夹」',
      async onClick() {
        const success = await UserFavService.addFav(avid)
        if (success) {
          antMessage.success(`已加入收藏夹「${defaultFavFolderTitle}」`)
        }
      },
    },
    {
      // 收藏
      key: 'watchlater:add-fav',
      icon: <IconForFav className='size-15px' />,
      label: '收藏到',
      async onClick() {
        await pickFavFolder(undefined, async (targetFolder) => {
          const success = await UserFavService.addFav(avid, targetFolder.id)
          if (success) antMessage.success(`已加入收藏夹「${targetFolder.title}」`)
          return success
        })
      },
    },
  ])

  const faved = !!folderNames.length
  return faved ? favedMenus : unfavedMenus
}

export function getFavTabMenus({
  item,
  cardData,
  tab,
  multiSelectingAppendix,
  onRemoveCurrent,
  recSharedEmitter,
}: {
  item: RecItemType
  cardData: IVideoCardData
  tab: ETab
  multiSelectingAppendix: string
  onRemoveCurrent: ((item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>) | undefined
  recSharedEmitter: RecSharedEmitter
}) {
  if (!isFav(item)) return []

  // 收藏夹
  if (item.from === 'fav-folder') {
    return defineAntMenus([
      {
        key: 'open-fav-folder',
        label: '浏览收藏夹',
        icon: <IconForOpenExternalLink className='size-15px' />,
        onClick() {
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
            const selectedFavItems = getMultiSelectedItems().filter((x) => isFav(x) && x.from === 'fav-folder')
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
            recSharedEmitter.emit('remove-cards', [uniqIds, titles, true])
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
    ])
  }

  // 合集
  if (item.from === 'fav-collection') {
    return defineAntMenus([
      {
        key: 'open-fav-collection',
        label: '浏览合集',
        icon: <IconForOpenExternalLink className='size-15px' />,
        onClick() {
          const { id } = item.collection
          const url =
            tab !== ETab.Fav || (favStore.selectedKey === 'all' && favStore.usingShuffle)
              ? `/?${FavQueryKey.CollectionIdFull}=${id}`
              : formatFavCollectionUrl(id)
          window.open(url, getLinkTarget())
        },
      },
    ])
  }

  // unexpected
  return []
}
