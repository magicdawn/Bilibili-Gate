import { Button, Input, Radio } from 'antd'
import { useSnapshot } from 'valtio'
import { useOnRefresh, useRecSelfContext } from '$components/Recommends/rec.shared'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForDelete } from '$modules/icon'
import { multiSelectStore } from '$modules/multi-select/store'
import { EHistoryDeviceTypeConfig, EHistoryItemTypeConfig } from '../enums'
import { removeMultiSelectedHistoryItems } from '../helper'
import { historyStore } from '../store'

export function HistoryTabbarView() {
  return (
    <>
      <HistoryItemTypeSwitch />
      <HistoryDeviceTypeSwitch />
      <HistorySearchInput />
      <MultiSelectActions />
    </>
  )
}

function HistoryItemTypeSwitch() {
  const { itemType } = useSnapshot(historyStore)
  const onRefresh = useOnRefresh()
  return (
    <Radio.Group
      buttonStyle='solid'
      size='small'
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
  const onRefresh = useOnRefresh()
  return (
    <Radio.Group
      buttonStyle='solid'
      size='small'
      value={deviceType}
      onChange={(e) => {
        historyStore.deviceType = e.target.value
        onRefresh()
      }}
    >
      {Object.entries(EHistoryDeviceTypeConfig).map(([itemType, { label }]) => (
        <Radio.Button key={itemType} value={itemType}>
          {label}
        </Radio.Button>
      ))}
    </Radio.Group>
  )
}

function HistorySearchInput() {
  return <Input.Search size='small' className='w-120px' />
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
