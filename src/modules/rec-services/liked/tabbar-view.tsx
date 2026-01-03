import { Tag } from 'antd'
import { AntdTooltip } from '$modules/antd/custom'
import type { LikedRecService } from '.'

export function LikedTabbarView({ service }: { service: LikedRecService }) {
  const { count } = service.useStore()
  if (!Number.isFinite(count)) return null
  return (
    <>
      <AntdTooltip title={`共 ${count} 个视频`}>
        <Tag color='success' variant='outlined' className='cursor-pointer'>
          {count}
        </Tag>
      </AntdTooltip>
    </>
  )
}
