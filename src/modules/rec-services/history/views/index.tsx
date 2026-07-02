import { Button, Input, Radio } from 'antd'
import { useSnapshot } from 'valtio'
import { useOnRefresh, useRecSelfContext } from '$components/Recommends/rec.shared'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForDelete } from '$modules/icon'
import { multiSelectStore } from '$modules/multi-select/store'
import { CopyBvidButtonsTabbarView } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { settings } from '$modules/settings'
import { EHistoryDeviceTypeConfig, EHistoryItemTypeConfig } from '../enums'
import { removeMultiSelectedHistoryItems } from '../helper'
import { historyStore } from '../store'
import type { SizeType } from 'antd/es/config-provider/SizeContext'

export function HistoryTabbarView() {
  return (
    <>
      <HistoryItemTypeSwitch />
      <HistoryDeviceTypeSwitch />
      <HistorySearchInput />
      <MultiSelectActions />
      <CopyBvidButtonsTabbarView />
    </>
  )
}

function useControlSize(): SizeType {
  const { tabbarViewSmallControlSize } = useSnapshot(settings.history)
  return tabbarViewSmallControlSize ? 'small' : undefined
}

function HistoryItemTypeSwitch() {
  const { itemType } = useSnapshot(historyStore)
  const onRefresh = useOnRefresh()
  return (
    <Radio.Group
      buttonStyle='solid'
      size={useControlSize()}
      value={itemType}
      onChange={(e) => {
        historyStore.itemType = e.target.value
        onRefresh()
      }}
    >
      {Object.entries(EHistoryItemTypeConfig).map(([itemType, { label }]) => (
        <Radio.Button key={itemType} value={itemType}>
          {label}
        </Radio.Button>
      ))}
    </Radio.Group>
  )
}

function HistoryDeviceTypeSwitch() {
  const { deviceType } = useSnapshot(historyStore)
  const { tabbarViewSmallControlSize } = useSnapshot(settings.history)
  const onRefresh = useOnRefresh()
  return (
    <Radio.Group
      buttonStyle='solid'
      size={useControlSize()}
      value={deviceType}
      onChange={(e) => {
        historyStore.deviceType = e.target.value
        onRefresh()
      }}
    >
      {Object.entries(EHistoryDeviceTypeConfig).map(([itemType, { label, Icon }]) => {
        const clsRadioButton = '[&_.ant-radio-button-label]:(h-full inline-flex items-center align-top)'
        const clsIconSize = tabbarViewSmallControlSize ? 'size-16px' : 'size-21px'
        return Icon ? (
          <AntdTooltip key={itemType} title={label}>
            <Radio.Button value={itemType} className={clsRadioButton}>
              <Icon className={clsIconSize} />
            </Radio.Button>
          </AntdTooltip>
        ) : (
          <Radio.Button key={itemType} value={itemType} className={clsRadioButton}>
            {label}
          </Radio.Button>
        )
      })}
    </Radio.Group>
  )
}

function HistorySearchInput() {
  const { searchText } = useSnapshot(historyStore, { sync: true })
  const onRefresh = useOnRefresh()
  return (
    <Input.Search
      size={useControlSize()}
      className='w-120px'
      allowClear
      value={searchText}
      onChange={(e) => (historyStore.searchText = e.target.value)}
      onSearch={(val) => {
        historyStore.searchText = val
        onRefresh()
      }}
    />
  )
}

function MultiSelectActions() {
  const { multiSelecting } = useSnapshot(multiSelectStore)
  const { recSharedEmitter } = useRecSelfContext()
  if (!multiSelecting) return null
  return (
    <>
      <AntdTooltip title='移除历史记录(多选)'>
        <Button className='icon-only-round-button' onClick={() => removeMultiSelectedHistoryItems(recSharedEmitter)}>
          <IconForDelete />
        </Button>
      </AntdTooltip>
    </>
  )
}
