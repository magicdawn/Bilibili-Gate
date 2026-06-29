import { useLockFn, useRequest } from 'ahooks'
import { delay } from 'es-toolkit'
import { useState, type MouseEvent, type ReactNode } from 'react'
import { checkIsHistory, type RecItemType } from '$define'
import { IconAnimatedChecked, IconForDelete, IconForLoading } from '$modules/icon'
import { removeSingleHistoryItem } from '$modules/rec-services/history/helper'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import type { IVideoCardData } from '$modules/filter/normalize'

export function useRemoveHistoryRelated({
  item,
  cardData,
  actionButtonVisible,
  onRemoveCurrent,
}: {
  item: RecItemType
  cardData: IVideoCardData
  actionButtonVisible: boolean
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>
}) {
  const enabled = checkIsHistory(item)
  const $req = useRequest((item: RecItemType) => removeSingleHistoryItem(item), { manual: true })
  const loading = $req.loading
  const [removed, setRemoved] = useState(false)

  const handleRemoveHistory = useLockFn(async (e: MouseEvent) => {
    if (!checkIsHistory(item)) return
    if (loading) return
    e.stopPropagation()
    e.preventDefault()
    const success = await $req.runAsync(item)
    if (success) {
      setRemoved(true)
      await delay(250) // IconAnimatedChecked 200ms
      onRemoveCurrent?.(item, cardData)
    }
  })

  let removeHistoryActionButton: ReactNode
  if (enabled) {
    const icon = loading ? (
      <IconForLoading className='size-16px' />
    ) : removed ? (
      <IconAnimatedChecked size={18} useAnimation />
    ) : (
      <IconForDelete className='size-18px' />
    )
    const tooltip = removed ? '已移除' : '点击移除历史记录'
    removeHistoryActionButton = (
      <VideoCardActionButton
        visible={actionButtonVisible}
        inlinePosition='right'
        icon={icon}
        tooltip={tooltip}
        onClick={handleRemoveHistory}
      />
    )
  }

  return { removeHistoryActionButton, handleRemoveHistory }
}
