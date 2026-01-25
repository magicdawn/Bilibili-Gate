import { useRequest } from 'ahooks'
import { Button, ConfigProvider } from 'antd'
import { useMemo } from 'react'
import { copyBvidInfos, copyBvidsSingleLine } from '$components/RecGrid/rec-grid-state'
import { ETab } from '$components/RecHeader/tab-enum'
import { useRecSelfContext } from '$components/Recommends/rec.shared'
import { IconForCopy } from '$modules/icon'
import { MultiSelectButton } from '$modules/multi-select'
import { useSettingsSnapshot } from '$modules/settings'
import { getOnlyTab } from '$routes'

export function CopyBvidButtons({ showCopyBvidInfo }: { showCopyBvidInfo?: boolean }) {
  const { __internalEnableCopyBvidInfo } = useSettingsSnapshot()
  const hasCopyBvidInfo = showCopyBvidInfo ?? __internalEnableCopyBvidInfo
  return (
    <>
      <Button onClick={copyBvidsSingleLine} className='inline-flex-center'>
        <IconForCopy /> 复制 BVID
      </Button>
      {hasCopyBvidInfo && (
        <Button onClick={copyBvidInfos} className='inline-flex-center'>
          <IconForCopy /> 复制 BVID 信息
        </Button>
      )}
    </>
  )
}

export function CopyBvidButtonsTabbarView() {
  const { __internalAddTabbarCopyBvidButton: enabled } = useSettingsSnapshot()
  if (!enabled) return null
  return (
    <div className='flex items-center gap-x-2'>
      <ConfigProvider theme={{ components: { Button: { paddingInline: 6 } } }}>
        <ButtonLoadToEnd />
        <MultiSelectButton iconOnly={false} />
        <CopyBvidButtons />
      </ConfigProvider>
    </div>
  )
}

function ButtonLoadToEnd() {
  const supportsLoadToEnd = useMemo(querySupportsLoadToEnd, [])
  const { recSharedEmitter } = useRecSelfContext()
  const $req = useRequest(() => recSharedEmitter.emit('load-to-end'), {
    manual: true,
  })

  return (
    supportsLoadToEnd && (
      <Button className='flex items-center gap-x-1' loading={$req.loading} onClick={() => $req.run()}>
        {!$req.loading && <IconLineMdDownloadOutlineLoop className='size-18px' />}
        加载全部
      </Button>
    )
  )
}

export function querySupportsLoadToEnd() {
  const onlyTab = getOnlyTab()
  return !!onlyTab && [ETab.DynamicFeed, ETab.SpaceUpload].includes(onlyTab)
}
