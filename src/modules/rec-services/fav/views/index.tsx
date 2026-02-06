import { useMemoizedFn, useMount, useUpdateEffect } from 'ahooks'
import { Button, Dropdown, Menu, Popover, Tag, Transfer } from 'antd'
import { delay, groupBy } from 'es-toolkit'
import { useMemo, useState, type Key, type ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import {
  FavFolderOrderSwitcher,
  sortFavFolders,
  type FavFolderOrder,
} from '$components/ModalFavManager/fav-folder-order'
import { useOnRefresh } from '$components/Recommends/rec.shared'
import { sidebarBottomLine, useRevealMenuSelectedKey } from '$components/RecSidebar/sidebar-shared'
import { defineAntMenus, type AntMenuItem, type PossibleAntMenuItem } from '$modules/antd'
import { IconForOpenExternalLink } from '$modules/icon'
import { CopyBvidButtonsTabbarView } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { formatSpaceUrl } from '$modules/rec-services/dynamic-feed/shared'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { sortListByName } from '$utility/sort'
import { proxyWithLocalStorage } from '$utility/valtio'
import { usePopupContainer } from '../../_base'
import { dropdownMenuStyle } from '../../_shared'
import { isFavFolderDefault, isFavFolderPrivate } from '../fav-util'
import { favStore, updateFavList, type FavStore } from '../store'
import type { TransferDirection } from 'antd/es/transfer'
import type { FavAllService } from '../service/fav-all'
import type { FavFolderBasicService } from '../service/fav-folder'

export const IconForAll = IconLucideList
export const IconForPrivateFolder = IconLucideFolderLock
export const IconForPublicFolder = IconLucideFolder
export const IconForCollection = IconIonLayersOutline

const viewLocalStore = proxyWithLocalStorage(
  { sidebarFavFolderOrder: 'default' as FavFolderOrder },
  'fav-rec-service:view',
)

function useScopeMenus(parentView: 'sidebarView' | 'tabbarView', extraOnMenuItemClick?: () => void) {
  const { folders, collections, selectedKey } = useSnapshot(favStore)
  const { sidebarFavFolderOrder } = useSnapshot(viewLocalStore)
  const onRefresh = useOnRefresh()

  const menuItems: AntMenuItem[] = useMemo(() => {
    /* #region fav-folder */
    let menuItemFavFolders: PossibleAntMenuItem
    {
      let _folders = folders
      let labelAddon: ReactNode
      if (parentView === 'sidebarView') {
        labelAddon = (
          <FavFolderOrderSwitcher
            value={sidebarFavFolderOrder}
            onChange={(v) => (viewLocalStore.sidebarFavFolderOrder = v)}
            className='ml-4'
          />
        )
        _folders = sortFavFolders(folders, sidebarFavFolderOrder)
      }
      const subMenus: AntMenuItem[] = _folders.map((f) => {
        const isDefault = isFavFolderDefault(f.attr)
        const isPrivate = isFavFolderPrivate(f.attr)
        const key: FavStore['selectedKey'] = `fav-folder:${f.id}`
        const icon = isPrivate ? <IconForPrivateFolder /> : <IconForPublicFolder />
        const label = `${f.title} (${f.media_count})`
        return {
          key,
          icon,
          label,
          async onClick() {
            favStore.selectedFavFolderId = f.id
            favStore.selectedFavCollectionId = undefined
            extraOnMenuItemClick?.()
            await delay(100)
            onRefresh()
          },
        }
      })
      menuItemFavFolders = !!_folders.length && {
        type: 'group',
        label: <div className='flex items-center justify-between line-height-snug'>收藏夹{labelAddon}</div>,
        children: subMenus,
      }
    }
    /* #endregion */

    /* #region fav-collection */
    let menuItemFavCollections: PossibleAntMenuItem
    {
      const collectionGrouped = groupBy(collections, (x) => x.upper.name)
      let entries = Object.entries(collectionGrouped).map(([upName, collections]) => ({
        upName,
        collections: sortListByName(collections, 'title'),
      }))
      entries = sortListByName(entries, 'upName')
      const subMenus: AntMenuItem[] = []
      for (const { upName, collections } of entries) {
        const upMid = collections[0]?.upper.mid
        const upSpaceUrl = upMid ? formatSpaceUrl(upMid) : '#'
        subMenus.push(
          ...defineAntMenus([
            {
              type: 'group',
              label: (
                <span className='flex items-center gap-x-2px'>
                  <IconForOpenExternalLink className='mt-2px size-15px flex-none' />
                  <a target='_blank' href={upSpaceUrl}>
                    @{upName}
                  </a>
                </span>
              ),
              children: collections.map((f) => {
                const key: FavStore['selectedKey'] = `fav-collection:${f.id}`
                const label = (
                  <span className='ml-8px flex items-center gap-x-2px'>
                    <IconForCollection className='size-15px flex-none' />
                    {f.title} ({f.media_count})
                  </span>
                )
                return {
                  key,
                  label,
                  title: `${f.title} (${f.media_count})`,
                  async onClick() {
                    favStore.selectedFavFolderId = undefined
                    favStore.selectedFavCollectionId = f.id
                    extraOnMenuItemClick?.()
                    await delay(100)
                    onRefresh()
                  },
                }
              }),
            },
          ]),
        )
      }
      menuItemFavCollections = !!collections.length && {
        type: 'group',
        label: '合集',
        children: subMenus,
      }
    }
    /* #endregion */

    return defineAntMenus([
      {
        key: 'all',
        icon: <IconForAll />,
        label: '全部',
        async onClick() {
          favStore.selectedFavFolderId = undefined
          favStore.selectedFavCollectionId = undefined
          extraOnMenuItemClick?.()
          await delay(100)
          onRefresh()
        },
      },
      menuItemFavFolders,
      menuItemFavCollections,
    ])
  }, [folders, collections, parentView, sidebarFavFolderOrder, onRefresh])

  return { menuItems, selectedKey }
}

export function FavTabbarView({ extraContent }: { extraContent?: ReactNode }) {
  const { fav, enableSidebar } = useSettingsSnapshot()
  const { selectedFavFolder, selectedFavCollection, selectedLabel, selectedKey } = useSnapshot(favStore)
  const onRefresh = useOnRefresh()
  const { ref, getPopupContainer } = usePopupContainer()

  useMount(() => {
    updateFavList()
  })

  // 分割线设置切换, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh()
    })()
  }, [fav.addSeparator])

  /* #region scope selection dropdown */
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false)
  const { menuItems } = useScopeMenus('tabbarView', () => {
    setScopeDropdownOpen(false)
  })

  const dropdownButtonClassName = 'relative top-[-0.5px] size-15px'
  const dropdownButtonIcon = selectedFavFolder ? (
    isFavFolderPrivate(selectedFavFolder.attr) ? (
      <IconForPrivateFolder className={dropdownButtonClassName} />
    ) : (
      <IconForPublicFolder className={dropdownButtonClassName} />
    )
  ) : selectedFavCollection ? (
    <IconForCollection className={dropdownButtonClassName} />
  ) : (
    <IconForAll className={dropdownButtonClassName} />
  )
  const dropdownButtonLabel = selectedLabel
  const scopeSelectionDropdown = (
    <Dropdown
      open={scopeDropdownOpen}
      onOpenChange={setScopeDropdownOpen}
      placement='bottomLeft'
      getPopupContainer={getPopupContainer}
      menu={{
        items: menuItems,
        style: { ...dropdownMenuStyle, border: `1px solid ${usePopoverBorderColor()}` },
        selectedKeys: [selectedKey],
      }}
    >
      <Button css={[scopeDropdownOpen && buttonOpenCss]}>
        <span className='h-full flex items-center gap-x-4px'>
          {dropdownButtonIcon}
          {dropdownButtonLabel}
        </span>
      </Button>
    </Dropdown>
  )
  /* #endregion */

  return (
    <div ref={ref} className='flex items-center gap-x-10px'>
      {/* scope selction */}
      {!enableSidebar && scopeSelectionDropdown}

      {/* extra */}
      {extraContent}

      <CopyBvidButtonsTabbarView />
    </div>
  )
}

export function ViewingAllExcludeFolderConfig({
  allFavFolderServices,
  state,
}: {
  allFavFolderServices: FavFolderBasicService[]
  state: FavAllService['state']
}) {
  const { fav } = useSettingsSnapshot()
  const onRefresh = useOnRefresh()
  const { ref, getPopupContainer } = usePopupContainer()
  const { totalCountInFavFolders } = useSnapshot(state)

  const [excludeFavFolderIdsChanged, setExcludeFavFolderIdsChanged] = useState(false)

  const handleChange = useMemoizedFn((newTargetKeys: Key[], direction: TransferDirection, moveKeys: Key[]) => {
    setExcludeFavFolderIdsChanged(true)
    settings.fav.excludedFolderIds = newTargetKeys.map((k) => k.toString())
  })

  // may contains legacy ids, so not `allFavFolderServices.length - excludeFavFolderIds.length`
  const foldersCount = useMemo(
    () => allFavFolderServices.filter((x) => !fav.excludedFolderIds.includes(x.entry.id.toString())).length,
    [allFavFolderServices, fav.excludedFolderIds],
  )

  const onPopupOpenChange = useMemoizedFn((open: boolean) => {
    // when open
    if (open) {
      setExcludeFavFolderIdsChanged(false)
    }

    // when close
    else if (excludeFavFolderIdsChanged) {
      onRefresh()
    }
  })

  return (
    <Popover
      getTooltipContainer={getPopupContainer}
      trigger={'click'}
      placement='bottom'
      onOpenChange={onPopupOpenChange}
      getPopupContainer={(el) => el.parentElement || document.body}
      content={
        <>
          <Transfer
            dataSource={allFavFolderServices}
            rowKey={(row) => row.entry.id.toString()}
            titles={['收藏夹', '忽略']}
            targetKeys={fav.excludedFolderIds}
            onChange={handleChange}
            render={(item) => item.entry.title}
            oneWay
            style={{ marginBottom: 10 }}
          />
        </>
      }
    >
      <Tag ref={ref} color='success' className='mx-0 cursor-pointer text-size-12px'>
        收藏夹({foldersCount}) 收藏({totalCountInFavFolders})
      </Tag>
    </Popover>
  )
}

export function FavSidebarView() {
  const { menuItems, selectedKey } = useScopeMenus('sidebarView')
  const { menuRef } = useRevealMenuSelectedKey(menuItems, selectedKey)
  return (
    <>
      <Menu ref={menuRef} items={menuItems} selectedKeys={[selectedKey]} mode='inline' inlineIndent={10} />
      {sidebarBottomLine}
    </>
  )
}
