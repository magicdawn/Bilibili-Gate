import { Tag } from 'antd'
import { useMemo } from 'react'
import { AntdTooltip } from '$modules/antd/custom'
import { CopyBvidButtonsTabbarView } from '../_shared/copy-bvid-buttons'
import type { LikedRecService } from '.'

export function LikedTabbarView({ service }: { service: LikedRecService }) {
  const { count, invalidCount } = service.useStore()
  const tooltip = useMemo(
    () => [`共 ${count} 个视频`, !!invalidCount && `已隐藏 ${invalidCount} 个已失效视频`].filter(Boolean).join(', '),
    [count, invalidCount],
  )
  if (!Number.isFinite(count)) return null

  return (
    <>
      <AntdTooltip title={tooltip}>
        <Tag color='success' variant='outlined' className='cursor-pointer'>
          {count}
        </Tag>
      </AntdTooltip>

      <CopyBvidButtonsTabbarView />
    </>
  )
}
