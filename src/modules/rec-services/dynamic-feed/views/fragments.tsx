import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { APP_CLS_USE_ANT_LINK_COLOR } from '$common/emotion-css'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForOpenExternalLink } from '$modules/icon'
import { formatFollowGroupUrl } from '../shared'
import { dfStore } from '../store'

export function SelectedGroupExternalLink({ addParens, className }: { addParens?: boolean; className?: string }) {
  const { selectedGroup, viewingSomeGroup } = useSnapshot(dfStore)
  const _className = useUnoMerge(
    'inline-flex items-center text-size-14px', // base style
    className,
  )

  return (
    viewingSomeGroup &&
    selectedGroup && (
      <span className={_className}>
        {addParens && '('}
        <AntdTooltip title='查看分组UP'>
          <a
            href={formatFollowGroupUrl(selectedGroup.tagid)}
            target='_blank'
            className={`mx-4px inline-flex items-center text-size-16px ${APP_CLS_USE_ANT_LINK_COLOR}`}
          >
            <IconForOpenExternalLink className='mr-2px size-18px' />
            {selectedGroup.name}
          </a>
        </AntdTooltip>
        {addParens && ')'}
      </span>
    )
  )
}
