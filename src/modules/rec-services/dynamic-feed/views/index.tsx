import { useMemoizedFn, useMount } from 'ahooks'
import { Avatar, Badge, Button, Dropdown, Menu } from 'antd'
import { fastSortWithRules } from 'fast-sort-lens'
import { useMemo, useState, type ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { useOnRefresh, useRecSelfContext } from '$components/Recommends/rec.shared'
import { sidebarBottomLine, useRevealMenuSelectedKey, useSidebarVisible } from '$components/RecSidebar/sidebar-shared'
import { ETab } from '$enums'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForReset } from '$modules/icon'
import { CopyBvidButtonsTabbarView } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { useSettingsSnapshot } from '$modules/settings'
import { getAvatarSrc } from '$utility/image'
import { mapNameForSort, zhLocaleComparer } from '$utility/sort'
import { usePopupContainer } from '../../_base'
import { dropdownMenuStyle } from '../../_shared'
import { IconForGroup, IconForUp } from '../shared'
import {
  DF_SELECTED_KEY_ALL,
  dfStore,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoType,
  updateFilterData,
  type DynamicFeedStore,
  type DynamicFeedStoreSelectedKey,
} from '../store'
import { usePopoverRelated } from './popover-related'
import type { AntMenuItem } from '$modules/antd'

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
  filterText: undefined,
  selectedGroupId: undefined,
  dynamicFeedVideoType: DynamicFeedVideoType.All,
  filterMinDuration: DynamicFeedVideoMinDuration.All,
}

// who's dynamic-feed
// from: sidebar-menu | dropdown-menu
function useScopeMenus(form: 'sidebar' | 'dropdown') {
  const { upList, groups, selectedKey, viewingSomeUp, viewingSomeGroup } = useSnapshot(dfStore)
  const onRefresh = useOnRefresh()
  const {
    followGroup: { enabled: followGroupEnabled },
  } = useSettingsSnapshot().dynamicFeed
  const { recSharedEmitter } = useRecSelfContext()

  const onSelect = useMemoizedFn((payload: Partial<typeof dfStore>) => {
    dynamicFeedFilterSelectUp(payload)
    onRefresh()
  })

  const onClear = useMemoizedFn(() => {
    onSelect({ ...clearPayload })
    recSharedEmitter.emit('dynamic-feed:clear')
  })

  const menuItems = useMemo((): AntMenuItem[] => {
    const itemAll: AntMenuItem = {
      key: 'all' satisfies DynamicFeedStoreSelectedKey,
      icon: <Avatar size='small'>全</Avatar>,
      label: '全部',
      title: '全部',
      onClick: onClear,
    }

    let groupItems: AntMenuItem[] = []
    if (followGroupEnabled) {
      groupItems = groups.map((group) => {
        return {
          key: `group:${group.tagid}` satisfies DynamicFeedStoreSelectedKey,
          icon: <Avatar size='small'>{group.name[0] || '组'}</Avatar>,
          label: `${group.name} (${group.count})`,
          title: `${group.name} (${group.count})`,
          onClick: () => onSelect({ ...clearPayload, selectedGroupId: group.tagid }),
        }
      })
    }

    let usingUpList = upList
    if (form === 'dropdown') {
      usingUpList = fastSortWithRules(upList, [
        { prop: (item) => (item.has_update ? 1 : 0), order: 'desc' },
        { prop: (item) => mapNameForSort(item.uname), order: zhLocaleComparer },
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
        label: (
          <span title={up.uname} className='block max-w-130px overflow-hidden text-ellipsis whitespace-nowrap'>
            {up.uname}
          </span>
        ),
        title: up.uname,
        onClick() {
          onSelect({ ...clearPayload, upMid: up.mid.toString(), upName: up.uname, upFace: up.face })
        },
      }
    })

    return [itemAll, ...groupItems, ...items]
  }, [upList, followGroupEnabled, groups, form])

  const btnClearAvailable = viewingSomeUp || viewingSomeGroup
  const btnClearDisabledWhenUnavailable = (
    <AntdTooltip title='返回「全部」'>
      <Button onClick={onClear} className='icon-only-round-button' disabled={!btnClearAvailable}>
        <IconForReset className='size-14px' />
      </Button>
    </AntdTooltip>
  )
  const btnClearHiddenWhenUnavailable = btnClearAvailable && (
    <AntdTooltip title='返回「全部」'>
      <Button onClick={onClear} className='icon-only-round-button'>
        <IconForReset className='size-14px' />
      </Button>
    </AntdTooltip>
  )

  return {
    menuItems,
    selectedKey,
    btnClear: btnClearDisabledWhenUnavailable,
    // helper
    onClear,
    onSelect,
  }
}

function useSharedElements() {
  const {
    dynamicFeed: {
      __internal: { externalFilterInput },
    },
  } = useSettingsSnapshot()

  const { ref, getPopupContainer } = usePopupContainer()
  const { popoverTrigger, filterInput } = usePopoverRelated({
    externalFilterInput,
    getPopupContainer,
  })

  return {
    popoverContainerRef: ref, // bind this ref to the desired popover container
    getPopupContainer,
    popoverTrigger,
    externalFilterInput,
    filterInput,
  }
}

export function DynamicFeedTabbarView() {
  const { viewingSomeUp, upName, upFace, selectedGroup } = useSnapshot(dfStore)
  const sidebarVisible = useSidebarVisible(ETab.DynamicFeed)
  const { menuItems, selectedKey, btnClear } = useScopeMenus('dropdown')
  const { popoverContainerRef, getPopupContainer, popoverTrigger, externalFilterInput, filterInput } =
    useSharedElements()

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

  return (
    <div ref={popoverContainerRef} className='inline-flex items-center gap-x-8px'>
      {sidebarVisible ? undefined : (
        <>
          {scopeDropdownMenu}
          {btnClear}
        </>
      )}

      {popoverTrigger}

      {externalFilterInput && filterInput}

      <CopyBvidButtonsTabbarView />
    </div>
  )
}

export function DynamicFeedSidebarView() {
  const sidebarVisible = useSidebarVisible(ETab.DynamicFeed)
  const { menuItems, selectedKey, btnClear } = useScopeMenus('sidebar')
  const { menuRef, revealSelected } = useRevealMenuSelectedKey(menuItems, selectedKey)
  const { recSharedEmitter } = useRecSelfContext()
  const { popoverTrigger, popoverContainerRef } = useSharedElements()

  useEmitterOn(recSharedEmitter, 'dynamic-feed:clear', () => void revealSelected(DF_SELECTED_KEY_ALL))
  if (!sidebarVisible) return undefined

  return (
    <>
      <div ref={popoverContainerRef} className='flex flex-row items-center gap-x-2 px-2 py-1'>
        {btnClear}
        {popoverTrigger}
      </div>
      <Menu ref={menuRef} items={menuItems} selectedKeys={[selectedKey]} mode='inline' inlineIndent={10} />
      {sidebarBottomLine}
    </>
  )
}
