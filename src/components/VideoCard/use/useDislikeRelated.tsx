/**
 * 我不想看
 */

import { useMemoizedFn } from 'ahooks'
import { pickDislikeReason } from '$components/ModalDislike'
import { handleDislike } from '$components/ModalDislike/api'
import { calcRecItemDislikedMapKey, dislikedMap } from '$components/ModalDislike/store'
import { PcDislikeReasons, type DislikeReason } from '$components/ModalDislike/types'
import { isAppRecommend, isPcRecommend, type RecItemType } from '$define'
import { antMessage } from '$modules/antd'
import { IconForDislike } from '$modules/icon'
import toast from '$utility/toast'
import { assertNever } from '$utility/type'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import type { MouseEvent } from 'react'

export const dislikeIcon = <IconForDislike className='size-16px' />

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

  const hasDislikeEntry = (isAppRecommend(item) && !!item.three_point?.dislike_reasons?.length) || isPcRecommend(item)

  const onTriggerDislike = useMemoizedFn(async (e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!hasDislikeEntry) {
      return antMessage.error('当前视频不支持提交「我不想看」')
    }

    // 已经是 dislike 状态
    const dislikeKey = calcRecItemDislikedMapKey(item)
    if (dislikeKey && dislikedMap.has(dislikeKey)) return

    let reasons: DislikeReason[]
    if (isAppRecommend(item)) {
      // app
      if (!authed) return toast('请先获取 access_key !')
      reasons = (item.three_point?.dislike_reasons || []).map((x) => ({ platform: 'app' as const, ...x }))
    } else if (isPcRecommend(item)) {
      // pc
      reasons = PcDislikeReasons
    } else {
      assertNever(item)
    }
    await pickDislikeReason(reasons, (reason) => handleDislike(item, reason))
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
