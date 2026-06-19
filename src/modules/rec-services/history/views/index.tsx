import { Radio } from 'antd'
import { useSnapshot } from 'valtio'
import { useOnRefresh } from '$components/Recommends/rec.shared'
import { settings } from '$modules/settings'
import { EHistoryItemTypeConfig } from '../enums'

export function HistoryTabbarView() {
  return (
    <>
      <HistoryItemTypeSwitch />
    </>
  )
}

function HistoryItemTypeSwitch() {
  const { itemType } = useSnapshot(settings.history)
  const onRefresh = useOnRefresh()
  return (
    <Radio.Group
      buttonStyle='solid'
      size='small'
      value={itemType}
      onChange={(e) => {
        settings.history.itemType = e.target.value
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
