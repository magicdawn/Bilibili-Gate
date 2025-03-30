import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { Input } from 'antd'
import { useSnapshot } from 'valtio'
import { InternalAddCopyBvidButtons } from '../_shared'
import { GenericOrderSwitcher } from '../_shared/generic-order-switcher'
import { SpaceUploadOrder, SpaceUploadOrderConfig } from './api'
import { spaceUploadStore } from './store'

export function SpaceUploadUsageInfo() {
  const { order, filterText } = useSnapshot(spaceUploadStore)
  const onRefresh = useOnRefreshContext()

  return (
    <div className='flex items-center gap-x-10px'>
      <GenericOrderSwitcher<SpaceUploadOrder>
        value={order}
        onChange={(value) => {
          spaceUploadStore.order = value
          onRefresh?.()
        }}
        list={[SpaceUploadOrder.Latest, SpaceUploadOrder.View, SpaceUploadOrder.Fav]}
        listDisplayConfig={SpaceUploadOrderConfig}
      />
      <Input.Search
        placeholder='搜索词'
        allowClear
        onSearch={(value) => {
          spaceUploadStore.searchText = value
          onRefresh?.()
        }}
      />
      <Input.Search
        placeholder='本地过滤词'
        allowClear
        onSearch={(value) => {
          spaceUploadStore.filterText = value
          onRefresh?.()
        }}
      />

      <InternalAddCopyBvidButtons />
    </div>
  )
}
