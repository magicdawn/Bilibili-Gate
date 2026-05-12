import { useUpdateEffect } from 'ahooks'
import { Button, Input, Radio, Tag } from 'antd'
import { delay } from 'es-toolkit'
import { useSnapshot } from 'valtio'
import { explainForFlag } from '$components/ModalSettings/index.shared'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefresh, useRecSelfContext } from '$components/Recommends/rec.shared'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForDelete, IconForShuffle, IconForTimeAsc, IconForTimeDesc } from '$modules/icon'
import { useMultiSelecting } from '$modules/multi-select/store'
import { settings, useSettingsSnapshot } from '$modules/settings'
import toast from '$utility/toast'
import { usePopupContainer } from '../_base'
import { BtnAddMultiSelectedToFav } from '../_shared/batch-toolbar-actions'
import { CopyBvidButtonsTabbarView } from '../_shared/copy-bvid-buttons'
import { GenericOrderSwitcher } from '../_shared/generic-order-switcher'
import { removeMultiSelectedWatchlaterItems, type WatchlaterRecService } from './index'
import { recentGateDescription } from './shared'
import { watchlaterStore } from './store'
import { WatchlaterItemsOrder } from './watchlater-enum'
import type { ComponentRef, ReactNode } from 'react'

export function WatchlaterTabbarView({ service }: { service: WatchlaterRecService }) {
  const { addSeparator, itemsOrder } = useSettingsSnapshot().watchlater
  const onRefresh = useOnRefresh()
  const { searchText } = useSnapshot(watchlaterStore, { sync: true })
  const multiSelecting = useMultiSelecting()
  const { recSharedEmitter } = useRecSelfContext()

  // 修改 watchlater 相关设置, 即时生效
  useUpdateEffect(() => {
    void (async () => {
      await delay(100)
      onRefresh()
    })()
  }, [addSeparator, itemsOrder])

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
          onRefresh()
        }}
      />

      {totalTag}

      {itemsOrder !== WatchlaterItemsOrder.Shuffle && <WatchlaterContinuePlaySettings />}

      {multiSelecting && (
        <AntdTooltip arrow={false} title='移除稍后再看 (多选)'>
          <Button
            className='icon-only-round-button'
            onClick={() => removeMultiSelectedWatchlaterItems(recSharedEmitter)}
          >
            <IconForDelete />
          </Button>
        </AntdTooltip>
      )}

      <BtnAddMultiSelectedToFav />

      <CopyBvidButtonsTabbarView />
    </div>
  )
}

const WatchlaterItemsOrderConfig: Record<
  WatchlaterItemsOrder,
  { icon?: ReactNode; label?: ReactNode; helpInfo?: ReactNode }
> = {
  [WatchlaterItemsOrder.AddTimeDesc]: {
    icon: <IconForTimeDesc />,
    label: '最近添加',
    helpInfo: '按添加时间倒序',
  },
  [WatchlaterItemsOrder.AddTimeAsc]: {
    icon: <IconForTimeAsc />,
    label: '最早添加',
    helpInfo: '按添加时间增序',
  },
  [WatchlaterItemsOrder.Shuffle]: {
    icon: <IconForShuffle />,
    label: '随机顺序',
    helpInfo: `随机但不包括近期添加的稍后再看, 近期指: ${recentGateDescription}`,
  },
}

const list = Object.values(WatchlaterItemsOrder)

const extraHelpInfo = (
  <div className='grid grid-cols-[repeat(2,max-content)] gap-x-1 gap-y-0 line-height-normal'>
    {list.map((x) => {
      const { icon, label, helpInfo } = WatchlaterItemsOrderConfig[x]
      return (
        <>
          <div className='flex-center gap-x-1'>
            {icon}
            {label}:&nbsp;
          </div>
          <div>{helpInfo}</div>
        </>
      )
    })}
  </div>
)

function WatchlaterOrderSwitcher() {
  const onRefresh = useOnRefresh()
  const { ref, getPopupContainer } = usePopupContainer<ComponentRef<'span'>>()
  const { itemsOrder } = useSettingsSnapshot().watchlater
  const { searchText } = useSnapshot(watchlaterStore)
  const disabled = !!searchText

  return (
    <GenericOrderSwitcher<WatchlaterItemsOrder>
      disabled={disabled}
      value={disabled ? WatchlaterItemsOrder.AddTimeDesc : itemsOrder}
      onChange={(next) => {
        settings.watchlater.itemsOrder = next
        onRefresh()
      }}
      list={list}
      listDisplayConfig={WatchlaterItemsOrderConfig}
      $ref={ref}
      dropdownProps={{ getPopupContainer }}
      extraHelpInfo={extraHelpInfo}
    />
  )
}

export function WatchlaterContinuePlaySettings() {
  const { continuePlay, continuePlayDirection } = useSnapshot(settings.watchlater)
  return (
    <div className='inline-flex-center gap-x-1'>
      <CheckboxSettingItem
        configPath='watchlater.continuePlay'
        label='连续播放'
        tooltip={explainForFlag('使用自动生成的「稍后再看」列表连续播放', '独立视频链接')}
      />
      <Radio.Group
        size='small'
        disabled={!continuePlay}
        value={continuePlayDirection}
        onChange={(e) => {
          const val = e.target.value
          settings.watchlater.continuePlayDirection = val as 'normal' | 'reverse'
        }}
      >
        <AntdTooltip title='逆序播放'>
          <Radio.Button value='reverse' className='[&_.ant-radio-button-label]:(h-full flex items-center)'>
            <IconTablerArrowNarrowLeft className='size-14px' />
          </Radio.Button>
        </AntdTooltip>
        <AntdTooltip
          title={
            <>
              顺序播放 (默认) <br />
              左至右, 上至下
            </>
          }
        >
          <Radio.Button value='normal' className='[&_.ant-radio-button-label]:(h-full flex items-center)'>
            <IconTablerArrowNarrowRight className='size-14px' />
          </Radio.Button>
        </AntdTooltip>
      </Radio.Group>
    </div>
  )
}
