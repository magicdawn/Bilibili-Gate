import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { AntdTooltip } from '$modules/antd/custom'
import { css } from '@emotion/react'
import { Button, Input } from 'antd'
import { useSnapshot } from 'valtio'
import { CopyBvidButtonsUsageInfo } from '../_shared/copy-bvid-buttons'
import { GenericOrderSwitcher } from '../_shared/generic-order-switcher'
import { SpaceUploadOrder, SpaceUploadOrderConfig } from './api'
import { SpaceUploadQueryKey, spaceUploadStore } from './store'

const fixAntdInputSearchAddonCss = css`
  .ant-input-group-addon {
    button {
      vertical-align: top;
      &:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      &:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }
`

export function SpaceUploadUsageInfo() {
  const { searchText, filterText } = useSnapshot(spaceUploadStore, { sync: true })
  const { order } = useSnapshot(spaceUploadStore)
  const onRefresh = useOnRefreshContext()

  const onSyncSearchTextToUrl = useMemoizedFn(() => {
    const u = new URL(location.href)
    const { searchText } = spaceUploadStore
    if (searchText) {
      u.searchParams.set(SpaceUploadQueryKey.SearchText, searchText)
    } else {
      u.searchParams.delete(SpaceUploadQueryKey.SearchText)
    }
    location.href = u.href
  })

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
        style={{ width: 200 }}
        placeholder='搜索词'
        allowClear
        css={fixAntdInputSearchAddonCss}
        addonAfter={
          <AntdTooltip title='同步搜索词到 URL'>
            <Button className='size-32px inline-flex-center p-0' onClick={onSyncSearchTextToUrl}>
              <IconCarbonUrl className='size-20px' />
            </Button>
          </AntdTooltip>
        }
        value={searchText}
        onChange={(e) => (spaceUploadStore.searchText = e.target.value)}
        onSearch={(value) => {
          spaceUploadStore.searchText = value
          onRefresh?.()
        }}
      />
      <Input.Search
        style={{ width: 180 }}
        placeholder='本地过滤词'
        allowClear
        value={filterText}
        onChange={(e) => (spaceUploadStore.filterText = e.target.value)}
        onSearch={(value) => {
          spaceUploadStore.filterText = value
          onRefresh?.()
        }}
      />

      <CheckboxSettingItem
        configPath='spaceUpload.showVol'
        label={'显示序号'}
        className='flex-none'
      />

      <CopyBvidButtonsUsageInfo />
    </div>
  )
}
