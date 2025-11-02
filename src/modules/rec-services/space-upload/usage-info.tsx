import { Input } from 'antd'
import { useSnapshot } from 'valtio'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { AntdTooltip } from '$modules/antd/custom'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { CopyBvidButtonsUsageInfo } from '../_shared/copy-bvid-buttons'
import { GenericOrderSwitcher } from '../_shared/generic-order-switcher'
import { SpaceUploadOrderConfig } from './api'
import { SpaceUploadQueryKey, spaceUploadStore } from './store'
import type { SpaceUploadOrder } from './api'

export function SpaceUploadUsageInfo() {
  const { searchText, filterText } = useSnapshot(spaceUploadStore, { sync: true })
  const { allowedOrders, usingOrder } = useSnapshot(spaceUploadStore)
  const {
    spaceUpload: { useSyncFilterTextFromSearchText },
  } = useSettingsSnapshot()
  const onRefresh = useOnRefreshContext()

  const onSyncStoreToUrl = useMemoizedFn(() => {
    syncFilterTextFromSearchText()
    const u = new URL(location.href)
    const { searchText, filterText } = spaceUploadStore
    searchText
      ? u.searchParams.set(SpaceUploadQueryKey.SearchText, searchText)
      : u.searchParams.delete(SpaceUploadQueryKey.SearchText)
    filterText
      ? u.searchParams.set(SpaceUploadQueryKey.FilterText, filterText)
      : u.searchParams.delete(SpaceUploadQueryKey.FilterText)
    history.replaceState({}, '', u.href)
  })

  const syncFilterTextFromSearchText = useMemoizedFn(() => {
    if (!settings.spaceUpload.useSyncFilterTextFromSearchText) return
    spaceUploadStore.filterText = spaceUploadStore.searchText
  })

  return (
    <div className='flex items-center gap-x-10px'>
      <GenericOrderSwitcher<SpaceUploadOrder>
        value={usingOrder}
        list={allowedOrders as SpaceUploadOrder[]}
        listDisplayConfig={SpaceUploadOrderConfig}
        onChange={(value) => {
          spaceUploadStore.order = value
          onRefresh?.()
        }}
      />
      <Input.Search
        style={{ width: 200 }}
        placeholder='搜索词'
        allowClear
        value={searchText}
        onChange={(e) => (spaceUploadStore.searchText = e.target.value)}
        onSearch={(value) => {
          spaceUploadStore.searchText = value
          onSyncStoreToUrl()
          onRefresh?.()
        }}
      />
      <Input.Search
        style={{ width: 200 }}
        placeholder='本地过滤词'
        allowClear
        value={filterText}
        addonBefore={
          <AntdTooltip title='同步搜索词'>
            <CheckboxSettingItem
              className='[&>.ant-checkbox-label]:hidden'
              configPath='spaceUpload.useSyncFilterTextFromSearchText'
              extraAction={(checked) => {
                if (checked) {
                  onSyncStoreToUrl()
                  onRefresh?.()
                }
              }}
            />
          </AntdTooltip>
        }
        disabled={useSyncFilterTextFromSearchText}
        onChange={(e) => (spaceUploadStore.filterText = e.target.value)}
        onSearch={(value) => {
          spaceUploadStore.filterText = value
          onSyncStoreToUrl()
          onRefresh?.()
        }}
      />

      <CheckboxSettingItem configPath='spaceUpload.showVol' label={'显示序号'} className='flex-none' />

      <CopyBvidButtonsUsageInfo />
    </div>
  )
}
