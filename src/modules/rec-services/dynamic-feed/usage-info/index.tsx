import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import type { AntMenuItem } from '$modules/antd'
import { IconForReset } from '$modules/icon'
import { CopyBvidButtonsUsageInfo } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { useSettingsSnapshot } from '$modules/settings'
import { getAvatarSrc } from '$utility/image'
import { localeComparer, mapNameForSort } from '$utility/sort'
import { Avatar, Badge, Button, Dropdown } from 'antd'
import { delay } from 'es-toolkit'
import { fastSortWithOrders } from 'fast-sort-lens'
import type { ReactNode } from 'react'
import { useSnapshot } from 'valtio'
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

export function DynamicFeedUsageInfo() {
  const { ref, getPopupContainer } = usePopupContainer()
  const onRefresh = useOnRefreshContext()

  const dfSettings = useSettingsSnapshot().dynamicFeed
  const { externalSearchInput } = dfSettings.__internal

  const {
    viewingSomeUp,
    upName,
    upFace,
    upList,

    groups,
    selectedGroup,

    selectedKey,
  } = useSnapshot(dfStore)

  // try update on mount
  useMount(() => {
    updateFilterData()
  })

  const onSelect = useMemoizedFn(async (payload: Partial<typeof dfStore>) => {
    dynamicFeedFilterSelectUp(payload)
    await delay(100)
    onRefresh?.()
  })

  const onClear = useMemoizedFn(() => {
    onSelect({ ...clearPayload })
  })

  // #region scope dropdown menus
  const menuItems = useMemo((): AntMenuItem[] => {
    const itemAll: AntMenuItem = {
      key: 'all' satisfies DynamicFeedStoreSelectedKey,
      icon: <Avatar size={'small'}>全</Avatar>,
      label: '全部',
      onClick: onClear,
    }

    let groupItems: AntMenuItem[] = []
    if (dfSettings.followGroup.enabled) {
      groupItems = groups.map((group) => {
        return {
          key: `group:${group.tagid}` satisfies DynamicFeedStoreSelectedKey,
          label: group.name + ` (${group.count})`,
          icon: <Avatar size={'small'}>组</Avatar>,
          onClick() {
            onSelect({ ...clearPayload, selectedGroupId: group.tagid })
          },
        }
      })
    }

    const upListSorted = fastSortWithOrders(upList, [
      { prop: (item) => (item.has_update ? 1 : 0), order: 'desc' },
      { prop: (item) => mapNameForSort(item.uname), order: localeComparer },
    ])

    const items: AntMenuItem[] = upListSorted.map((up) => {
      let avatar: ReactNode = <Avatar size={'small'} src={getAvatarSrc(up.face)} />
      if (up.has_update) {
        avatar = <Badge dot>{avatar}</Badge>
      }

      return {
        key: `up:${up.mid}` satisfies DynamicFeedStoreSelectedKey,
        icon: avatar,
        // label: up.uname,
        label: (
          <span title={up.uname} className='block max-w-130px text-ellipsis whitespace-nowrap overflow-hidden'>
            {up.uname}
          </span>
        ),
        onClick() {
          onSelect({ ...clearPayload, upMid: up.mid.toString(), upName: up.uname, upFace: up.face })
        },
      }
    })

    return [itemAll, ...groupItems, ...items]
  }, [upList, dfSettings.followGroup.enabled, groups])

  const followGroupMidsCount = selectedGroup?.count
  const upIcon = <IconForUp className='size-14px mt--2px' />
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
    <>
      <div ref={ref} className='inline-flex items-center gap-x-8px'>
        {scopeDropdownMenu}

        {(viewingSomeUp || selectedGroup) && (
          <Button onClick={onClear} className='gap-0'>
            <IconForReset className='size-14px mr-5px' />
            <span>清除</span>
          </Button>
        )}

        {popoverTrigger}

        {externalSearchInput && searchInput}

        <CopyBvidButtonsUsageInfo />
      </div>
    </>
  )
}
