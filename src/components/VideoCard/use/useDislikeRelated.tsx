/**
 * 我不想看
 */

import { showModalDislike } from '$components/ModalDislike'
import { isAppRecommend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { antMessage } from '$modules/antd'
import { IconForDislike } from '$modules/icon'
import toast from '$utility/toast'
import { size } from 'polished'
import type { MouseEvent } from 'react'
import { VideoCardActionButton } from '../child-components/VideoCardActions'

export const dislikeIcon = <IconForDislike {...size(16)} />

export function useDislikeRelated({
  item,
  authed,
  actionButtonVisible,
}: {
  item: RecItemType
  authed: boolean
  actionButtonVisible: boolean
}) {
  // show icon even accessKey not found
  // https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate/discussions/244405

  const hasDislikeEntry = isAppRecommend(item) && !!item.three_point?.dislike_reasons?.length

  const onTriggerDislike = useMemoizedFn((e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!hasDislikeEntry) {
      if (item.api !== EApiType.AppRecommend) {
        return antMessage.error('当前视频不支持提交「我不想看」')
      }
      return
    }

    if (!authed) {
      return toast('请先获取 access_key ~')
    }

    showModalDislike(item)
  })

  const dislikeButtonEl = hasDislikeEntry && (
    <VideoCardActionButton
      visible={actionButtonVisible}
      inlinePosition='left'
      icon={dislikeIcon}
      tooltip='我不想看'
      onClick={onTriggerDislike}
    />
  )

  return { dislikeButtonEl, hasDislikeEntry, onTriggerDislike }
}
