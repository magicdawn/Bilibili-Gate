import { Avatar, Badge, Button, Dropdown, Menu } from 'antd'
import { delay } from 'es-toolkit'
import { fastSortWithOrders } from 'fast-sort-lens'
import { useSnapshot } from 'valtio'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { IconForReset } from '$modules/icon'
import { CopyBvidButtonsTabbarView } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { useSettingsSnapshot } from '$modules/settings'
import { getAvatarSrc } from '$utility/image'
import { localeComparer, mapNameForSort } from '$utility/sort'
import type { AntMenuItem } from '$modules/antd'
import { usePopupContainer } from '../../_base'
import { dropdownMenuStyle } from '../../_shared'
import { IconForGroup, IconForUp } from '../shared'
import {
  dfStore,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoType,
  updateFilterData,
  type DynamicFeedStore,
  type DynamicFeedStoreSelectedKey,
} from '../store'
import { usePopoverRelated } from './popover-related'
import type { ReactNode } from 'react'

export function dynamicFeedFilterSelectUp(payload: Partial<typeof dfStore>) {
  Object.assign(dfStore, payload)
  // 选择了 up, 去除红点
  if (payload.upMid) {
    const item = dfStore.upList.find((x) => x.mid.toString() === payload.upMid)
    if (item) item.has_update = false
  }
}

const clearPayload: Partial<DynamicFeedStore> = {
  upMid: undefined,
  upName: undefined,
  upFace: undefined,
  searchText: undefined,
  selectedGroupId: undefined,
  dynamicFeedVideoType: DynamicFeedVideoType.All,
  filterMinDuration: DynamicFeedVideoMinDuration.All,
}

// who's dynamic-feed
function useScopeMenus(form: 'dropdown' | 'sidebar') {
  const { upList, groups, selectedKey } = useSnapshot(dfStore)
  const onRefresh = useOnRefreshContext()
  const {
    followGroup: { enabled: followGroupEnabled },
  } = useSettingsSnapshot().dynamicFeed

  const onSelect = useMemoizedFn(async (payload: Partial<typeof dfStore>) => {
    dynamicFeedFilterSelectUp(payload)
    await delay(100)
    onRefresh?.()
  })

  const onClear = useMemoizedFn(() => {
    onSelect({ ...clearPayload })
  })

  const menuItems = useMemo((): AntMenuItem[] => {
    const itemAll: AntMenuItem = {
      key: 'all' satisfies DynamicFeedStoreSelectedKey,
      icon: <Avatar size='small'>全</Avatar>,
      label: '全部',
      onClick: onClear,
    }

    let groupItems: AntMenuItem[] = []
    if (followGroupEnabled) {
      groupItems = groups.map((group) => {
        return {
          key: `group:${group.tagid}` satisfies DynamicFeedStoreSelectedKey,
          label: `${group.name} (${group.count})`,
          icon: <Avatar size='small'>{group.name[0] || '组'}</Avatar>,
          onClick: () => onSelect({ ...clearPayload, selectedGroupId: group.tagid }),
        }
      })
    }

    let usingUpList = upList
    if (form === 'dropdown') {
      usingUpList = fastSortWithOrders(upList, [
        { prop: (item) => (item.has_update ? 1 : 0), order: 'desc' },
        { prop: (item) => mapNameForSort(item.uname), order: localeComparer },
      ])
    }

    const items: AntMenuItem[] = usingUpList.map((up) => {
      let avatar: ReactNode = <Avatar size='small' src={getAvatarSrc(up.face)} />
      if (up.has_update) {
        avatar = <Badge dot>{avatar}</Badge>
      }

      return {
        key: `up:${up.mid}` satisfies DynamicFeedStoreSelectedKey,
        icon: avatar,
        // label: up.uname,
        label: (
          <span title={up.uname} className='block max-w-130px overflow-hidden text-ellipsis whitespace-nowrap'>
            {up.uname}
          </span>
        ),
        onClick() {
          onSelect({ ...clearPayload, upMid: up.mid.toString(), upName: up.uname, upFace: up.face })
        },
      }
    })

    return [itemAll, ...groupItems, ...items]
  }, [upList, followGroupEnabled, groups, form])

  return {
    menuItems,
    selectedKey,
    // helper
    onClear,
    onSelect,
  }
}

export function DynamicFeedTabbarView() {
  const {
    dynamicFeed: {
      __internal: { externalSearchInput },
    },
    enableSidebar,
  } = useSettingsSnapshot()
  const { viewingSomeUp, upName, upFace, selectedGroup } = useSnapshot(dfStore)
  const onRefresh = useOnRefreshContext()
  const { ref, getPopupContainer } = usePopupContainer()
  const { menuItems, selectedKey, onClear } = useScopeMenus('dropdown')

  // try update on mount
  useMount(() => {
    updateFilterData()
  })

  // #region scope dropdown
  const followGroupMidsCount = selectedGroup?.count
  const upIcon = <IconForUp className='mt--2px size-14px' />
  const upAvtar = upFace ? <Avatar size={20} src={getAvatarSrc(upFace)} /> : undefined
  const dropdownButtonIcon = viewingSomeUp ? (
    upAvtar || upIcon
  ) : selectedGroup ? (
    <IconForGroup className='size-18px' />
  ) : undefined
  const dropdownButtonLabel = viewingSomeUp
    ? upName
    : selectedGroup
      ? selectedGroup.name + (followGroupMidsCount ? ` (${followGroupMidsCount})` : '')
      : '全部'

  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false)
  const scopeDropdownMenu = (
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
      <Button icon={dropdownButtonIcon} className='gap-4px' css={[scopeDropdownOpen && buttonOpenCss]}>
        {dropdownButtonLabel}
      </Button>
    </Dropdown>
  )
  // #endregion

  const { popoverTrigger, searchInput } = usePopoverRelated({
    externalSearchInput,
    onRefresh,
    getPopupContainer,
  })

  return (
    <div ref={ref} className='inline-flex items-center gap-x-8px'>
      {!enableSidebar && scopeDropdownMenu}

      {(viewingSomeUp || selectedGroup) && (
        <Button onClick={onClear} className='gap-0'>
          <IconForReset className='mr-5px size-14px' />
          <span>清除</span>
        </Button>
      )}

      {popoverTrigger}

      {externalSearchInput && searchInput}

      <CopyBvidButtonsTabbarView />
    </div>
  )
}

export function DynamicFeedSidebarInfo() {
  const { menuItems, selectedKey } = useScopeMenus('sidebar')
  return (
    <Menu
      //
      items={menuItems}
      selectedKeys={[selectedKey]}
      mode='inline'
      inlineIndent={10}
    />
  )
}
