import { Button, Input, Tag } from 'antd'
import { delay } from 'es-toolkit'
import { useSnapshot } from 'valtio'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForRemove, IconForShuffle, IconForTimestamp, withAscIcon, withDescIcon } from '$modules/icon'
import { useMultiSelecting } from '$modules/multi-select/store'
import { settings, useSettingsSnapshot } from '$modules/settings'
import toast from '$utility/toast'
import type { ETab } from '$components/RecHeader/tab-enum'
import { usePopupContainer } from '../_base'
import { CopyBvidButtonsUsageInfo } from '../_shared/copy-bvid-buttons'
import { GenericOrderSwitcher } from '../_shared/generic-order-switcher'
import type { UsageInfoPropsFor } from '../UsageInfo'
import { watchlaterStore } from './store'
import { WatchlaterItemsOrder } from './watchlater-enum'
import { removeMultiSelectedWatchlaterItems } from '.'
import type { ElementRef, ReactNode } from 'react'

export function WatchlaterUsageInfo({ service }: UsageInfoPropsFor<ETab.Watchlater>) {
  const { watchlaterAddSeparator, watchlaterItemsOrder } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()
  const { searchText } = useSnapshot(watchlaterStore, { sync: true })
  const multiSelecting = useMultiSelecting()

  // 切换 添加分割线 设置, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh?.()
    })()
  }, [watchlaterAddSeparator, watchlaterItemsOrder])

  const { total } = useSnapshot(service.state)
  const title = searchText ? `共 ${total} 条搜索结果` : `共 ${total} 个视频`
  const totalTag = typeof total === 'number' && (
    <Tag
      color='success'
      style={{
        marginRight: 0,
        marginTop: 1,
        cursor: 'pointer',
      }}
      title={title}
      onClick={() => {
        toast(`稍后再看: ${title}`)
      }}
    >
      {total}
    </Tag>
  )

  return (
    <div className='flex items-center gap-x-12px'>
      <WatchlaterOrderSwitcher />

      <Input.Search
        allowClear
        placeholder='搜索稍后再看'
        style={{ width: 180 }}
        value={searchText}
        onChange={(e) => (watchlaterStore.searchText = e.target.value)}
        onSearch={(val) => {
          watchlaterStore.searchText = val
          onRefresh?.()
        }}
      />

      {totalTag}

      {multiSelecting && (
        <AntdTooltip arrow={false} title='移除稍后再看 (多选)'>
          <Button className='icon-only-round-button' onClick={removeMultiSelectedWatchlaterItems}>
            <IconForRemove />
          </Button>
        </AntdTooltip>
      )}

      <CopyBvidButtonsUsageInfo />
    </div>
  )
}

const WatchlaterItemsOrderConfig: Record<
  WatchlaterItemsOrder,
  { icon?: ReactNode; label?: ReactNode; helpInfo?: ReactNode }
> = {
  [WatchlaterItemsOrder.AddTimeDesc]: {
    icon: <IconForTimestamp />,
    label: withDescIcon('最近添加'),
    helpInfo: '按添加时间倒序',
  },
  [WatchlaterItemsOrder.AddTimeAsc]: {
    icon: <IconForTimestamp />,
    label: withAscIcon('最早添加'),
    helpInfo: '按添加时间增序',
  },
  [WatchlaterItemsOrder.Shuffle]: {
    icon: <IconForShuffle />,
    label: '随机顺序',
    helpInfo: '不包括近期添加的稍后再看, 近期: 最近48小时内',
  },
}

const list = Object.values(WatchlaterItemsOrder)

const extraHelpInfo = (
  <div className='flex flex-col gap-y-4px'>
    {list.map((x) => {
      const { icon, label, helpInfo } = WatchlaterItemsOrderConfig[x]
      return (
        <div key={x} className={'flex items-center justify-left gap-x-4px line-height-[0]'}>
          {icon} <span className='min-w-80px'>{label}</span> :&nbsp;&nbsp; {helpInfo}
        </div>
      )
    })}
  </div>
)

function WatchlaterOrderSwitcher() {
  const onRefresh = useOnRefreshContext()
  const { ref, getPopupContainer } = usePopupContainer<ElementRef<'span'>>()
  const { watchlaterItemsOrder } = useSettingsSnapshot()
  const { searchText } = useSnapshot(watchlaterStore)
  const disabled = !!searchText

  return (
    <GenericOrderSwitcher<WatchlaterItemsOrder>
      disabled={disabled}
      value={disabled ? WatchlaterItemsOrder.AddTimeDesc : watchlaterItemsOrder}
      onChange={async (next) => {
        settings.watchlaterItemsOrder = next
        await delay(100)
        onRefresh?.()
      }}
      list={list}
      listDisplayConfig={WatchlaterItemsOrderConfig}
      $ref={ref}
      dropdownProps={{ getPopupContainer }}
      extraHelpInfo={extraHelpInfo}
    />
  )
}
