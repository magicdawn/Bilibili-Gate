import { useMemoizedFn, useMount } from 'ahooks'
import { Input, Space } from 'antd'
import { useSnapshot } from 'valtio'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefresh, useRecSelfContext } from '$components/Recommends/rec.shared'
import { AntdTooltip } from '$modules/antd/custom'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { CopyBvidButtonsTabbarView } from '../_shared/copy-bvid-buttons'
import { GenericOrderSwitcher } from '../_shared/generic-order-switcher'
import { SpaceUploadOrderConfig, type SpaceUploadOrder } from './api'
import { SpaceUploadQueryKey, spaceUploadStore } from './store'

export function SpaceUploadTabbarView() {
  const { searchText, filterText } = useSnapshot(spaceUploadStore, { sync: true })
  const { allowedOrders, usingOrder } = useSnapshot(spaceUploadStore)
  const {
    spaceUpload: { useSyncFilterTextFromSearchText },
  } = useSettingsSnapshot()
  const onRefresh = useOnRefresh()
  const { recSharedEmitter } = useRecSelfContext()

  const onSyncStoreToUrl = useMemoizedFn(() => {
    syncFilterTextFromSearchText()
    const { searchText, filterText } = spaceUploadStore
    const currentUrl = location.href
    const u = new URL(currentUrl)
    searchText
      ? u.searchParams.set(SpaceUploadQueryKey.SearchText, searchText)
      : u.searchParams.delete(SpaceUploadQueryKey.SearchText)
    filterText
      ? u.searchParams.set(SpaceUploadQueryKey.FilterText, filterText)
      : u.searchParams.delete(SpaceUploadQueryKey.FilterText)
    if (u.href !== currentUrl) {
      history.replaceState({}, '', u.href)
    }
  })

  const syncFilterTextFromSearchText = useMemoizedFn(() => {
    if (!settings.spaceUpload.useSyncFilterTextFromSearchText) return
    spaceUploadStore.filterText = spaceUploadStore.searchText
  })

  // initial sync
  useMount(onSyncStoreToUrl)

  return (
    <div className='flex items-center gap-x-10px'>
      <GenericOrderSwitcher<SpaceUploadOrder>
        value={usingOrder}
        list={allowedOrders as SpaceUploadOrder[]}
        listDisplayConfig={SpaceUploadOrderConfig}
        onChange={(value) => {
          spaceUploadStore.order = value
          onRefresh()
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
          onRefresh()
        }}
      />
      <Space.Compact>
        <Space.Addon>
          <AntdTooltip title={<>精准搜索: 自动将搜索词同步到过滤词</>}>
            <CheckboxSettingItem
              className='[&>.ant-checkbox-label]:hidden'
              configPath='spaceUpload.useSyncFilterTextFromSearchText'
              extraAction={(checked) => {
                if (checked) {
                  onSyncStoreToUrl()
                  onRefresh()
                }
              }}
            />
          </AntdTooltip>
        </Space.Addon>
        <Input.Search
          style={{ width: 200 }}
          placeholder='本地过滤词'
          allowClear
          value={filterText}
          disabled={useSyncFilterTextFromSearchText}
          onChange={(e) => (spaceUploadStore.filterText = e.target.value)}
          onSearch={(value) => {
            spaceUploadStore.filterText = value
            onSyncStoreToUrl()
            onRefresh()
          }}
        />
      </Space.Compact>

      <CheckboxSettingItem configPath='spaceUpload.showVol' label={'显示序号'} className='flex-none' />

      <CopyBvidButtonsTabbarView />
    </div>
  )
}
