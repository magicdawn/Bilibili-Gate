import { Button } from 'antd'
import { copyBvidInfos, copyBvidsSingleLine } from '$components/RecGrid/rec-grid-state'
import { IconForCopy } from '$modules/icon'
import { MultiSelectButton } from '$modules/multi-select'
import { useSettingsSnapshot } from '$modules/settings'

export function CopyBvidButtons() {
  const { __internalEnableCopyBvidInfo: bvidInfo } = useSettingsSnapshot()
  return (
    <>
      <Button onClick={copyBvidsSingleLine} className='inline-flex-center'>
        <IconForCopy /> 复制 BVID
      </Button>
      {bvidInfo && (
        <Button onClick={copyBvidInfos} className='inline-flex-center'>
          <IconForCopy /> 复制 BVID 信息
        </Button>
      )}
    </>
  )
}

export function CopyBvidButtonsUsageInfo() {
  const { __internalAddCopyBvidButton: enabled } = useSettingsSnapshot()
  if (!enabled) return null
  return (
    <>
      <CopyBvidButtons />
      <MultiSelectButton iconOnly={false} />
    </>
  )
}
