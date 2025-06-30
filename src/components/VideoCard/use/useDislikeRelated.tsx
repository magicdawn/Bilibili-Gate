/**
 * 我不想看
 */

import { useLockFn } from 'ahooks'
import { OPERATION_FAIL_MSG } from '$common'
import { dislikedIds, pickDislikeReason, type Reason } from '$components/ModalDislike'
import { isAppRecommend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { antMessage } from '$modules/antd'
import { IconForDislike } from '$modules/icon'
import toast, { toastRequestFail } from '$utility/toast'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import { dislike } from '../services'
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

  const hasDislikeEntry = isAppRecommend(item) && !!item.three_point?.dislike_reasons?.length

  const onTriggerDislike = useMemoizedFn(async (e?: MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!hasDislikeEntry) {
      if (item.api !== EApiType.AppRecommend) {
        return antMessage.error('当前视频不支持提交「我不想看」')
      }
      return
    }

    if (!authed) {
      return toast('请先获取 access_key !')
    }

    // 已经是 dislike 状态
    if (item?.param && dislikedIds.has(item.param)) {
      return
    }

    await pickDislikeReason(item.three_point?.dislike_reasons || [], handleConfirmDislike)
  })

  const handleConfirmDislike = useLockFn(async (reason: Reason) => {
    if (!isAppRecommend(item)) return

    let success = false
    let message: string = ''
    let err: Error | undefined
    try {
      ;({ success, message } = await dislike(item, reason.id))
    } catch (e) {
      err = e as Error
    }
    if (err) {
      console.error(err.stack || err)
      return toastRequestFail()
    }

    if (success) {
      antMessage.success('已标记不想看')
      dislikedIds.set(item.param, { ...reason })
    } else {
      // fail
      antMessage.error(message || OPERATION_FAIL_MSG)
    }

    return success
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
