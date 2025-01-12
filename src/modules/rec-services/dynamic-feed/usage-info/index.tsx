import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { copyBvidInfos, copyBvidsSingleLine } from '$components/RecGrid/unsafe-window-export'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { IconForReset } from '$modules/icon'
import { useSettingsSnapshot } from '$modules/settings'
import type { AntMenuItem } from '$utility/antd'
import { antMessage } from '$utility/antd'
import { getAvatarSrc } from '$utility/image'
import { css } from '@emotion/react'
import { Avatar, Badge, Button, Dropdown, Space } from 'antd'
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
  selectedFollowGroupTagId: undefined,
  dynamicFeedVideoType: DynamicFeedVideoType.All,
  filterMinDuration: DynamicFeedVideoMinDuration.All,
}

export function DynamicFeedUsageInfo() {
  const { ref, getPopupContainer } = usePopupContainer()
  const onRefresh = useOnRefreshContext()

  const dfSettings = useSettingsSnapshot().dynamicFeed
  const { addCopyBvidButton, externalSearchInput } = dfSettings.__internal

  const {
    viewingSomeUp,
    upName,
    upFace,
    upList,

    followGroups,
    selectedFollowGroup,

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

  const menuItems = useMemo((): AntMenuItem[] => {
    const itemAll: AntMenuItem = {
      key: 'all' satisfies DynamicFeedStoreSelectedKey,
      icon: <Avatar size={'small'}>全</Avatar>,
      label: '全部',
      onClick: onClear,
    }

    let groupItems: AntMenuItem[] = []
    if (dfSettings.followGroup.enabled) {
      groupItems = followGroups.map((group) => {
        return {
          key: `group:${group.tagid}` satisfies DynamicFeedStoreSelectedKey,
          label: group.name + ` (${group.count})`,
          icon: <Avatar size={'small'}>组</Avatar>,
          onClick() {
            onSelect({ ...clearPayload, selectedFollowGroupTagId: group.tagid })
          },
        }
      })
    }

    function mapName(name: string) {
      return (
        name
          .toLowerCase()
          // 让字母在前面
          .replace(/^([a-z])/, '999999$1')
      )
    }

    const upListSorted = fastSortWithOrders(upList, [
      { prop: (it) => (it.has_update ? 1 : 0), order: 'desc' },
      {
        prop: 'uname',
        order: (a: string, b: string) => {
          ;[a, b] = [a, b].map(mapName)
          return a.localeCompare(b, 'zh-CN')
        },
      },
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
          <span
            title={up.uname}
            css={css`
              display: block;
              max-width: 130px;
              text-overflow: ellipsis;
              white-space: nowrap;
              overflow: hidden;
            `}
          >
            {up.uname}
          </span>
        ),
        onClick() {
          onSelect({ ...clearPayload, upMid: up.mid.toString(), upName: up.uname, upFace: up.face })
        },
      }
    })

    return [itemAll, ...groupItems, ...items]
  }, [upList, dfSettings.followGroup.enabled, followGroups])

  // #region scope dropdown menus
  const followGroupMidsCount = selectedFollowGroup?.count
  const upIcon = <IconForUp {...size(14)} className='mt--2px' />
  const upAvtar = upFace ? <Avatar size={20} src={getAvatarSrc(upFace)} /> : undefined
  const dropdownButtonIcon = viewingSomeUp ? (
    upAvtar || upIcon
  ) : selectedFollowGroup ? (
    <IconForGroup {...size(18)} />
  ) : undefined
  const dropdownButtonLabel = viewingSomeUp
    ? upName
    : selectedFollowGroup
      ? selectedFollowGroup.name + (followGroupMidsCount ? ` (${followGroupMidsCount})` : '')
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
      <Button
        icon={dropdownButtonIcon}
        className='gap-4px'
        css={[scopeDropdownOpen && buttonOpenCss]}
      >
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
      <Space ref={ref}>
        {scopeDropdownMenu}

        {(viewingSomeUp || selectedFollowGroup) && (
          <Button onClick={onClear} className='gap-0'>
            <IconForReset className='size-14px mr-5px' />
            <span>清除</span>
          </Button>
        )}

        {popoverTrigger}

        {externalSearchInput && searchInput}

        {addCopyBvidButton && (
          <>
            <Button
              onClick={() => {
                copyBvidsSingleLine()
                antMessage.success('已复制')
              }}
            >
              Copy Bvids SingleLine
            </Button>
            <Button
              onClick={() => {
                copyBvidInfos()
                antMessage.success('已复制')
              }}
            >
              Copy Bvid Infos
            </Button>
          </>
        )}
      </Space>
    </>
  )
}
