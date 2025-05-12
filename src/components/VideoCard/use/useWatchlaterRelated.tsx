import { isAppRecommend, isPcRecommend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { antMessage } from '$modules/antd'
import { IconForLoading, IconForWatchlater } from '$modules/icon'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { watchlaterState } from '$modules/rec-services/watchlater'
import { usePrevious, useRequest } from 'ahooks'
import { delay } from 'es-toolkit'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import { watchlaterAdd, watchlaterDel } from '../services'
import type { VideoCardInnerProps } from '..'
import type { IVideoCardData } from '../process/normalize'
import type { MouseEvent } from 'react'

/**
 * 稍候再看
 */
export function useWatchlaterRelated({
  item,
  cardData,
  onRemoveCurrent,
  actionButtonVisible,
  watchlaterAdded,
}: {
  item: RecItemType
  cardData: IVideoCardData
  onRemoveCurrent: VideoCardInnerProps['onRemoveCurrent']
  actionButtonVisible: boolean
  watchlaterAdded: boolean
}) {
  const { avid, bvid } = cardData

  const hasWatchlaterEntry = useMemo(() => {
    if (isAppRecommend(item) || isPcRecommend(item)) {
      return item.goto === 'av'
    }
    if (item.api === EApiType.Rank) {
      return cardData.goto === 'av'
    }
    if (item.api === EApiType.Live) {
      return false
    }
    return true
  }, [item, cardData])

  type UsingAction = typeof watchlaterAdd | typeof watchlaterDel

  const $req = useRequest((usingAction: UsingAction, avid: string) => usingAction(avid), {
    manual: true,
  })

  // watchlater added
  const watchlaterAddedPrevious = usePrevious(watchlaterAdded)

  const onToggleWatchlater = useMemoizedFn(
    async (e?: MouseEvent, usingAction?: UsingAction): Promise<{ success: boolean; targetState?: boolean }> => {
      e?.preventDefault()
      e?.stopPropagation()

      // already loading
      if ($req.loading) return { success: false }

      if (!avid || !bvid) {
        return { success: false }
      }

      // run the action
      usingAction ??= watchlaterAdded ? watchlaterDel : watchlaterAdd
      const success = await $req.runAsync(usingAction, avid)

      const targetState = usingAction === watchlaterAdd ? true : false
      if (success) {
        if (targetState) {
          watchlaterState.bvidSet.add(bvid)
        } else {
          watchlaterState.bvidSet.delete(bvid)
        }

        // 稍后再看
        if (item.api === EApiType.Watchlater) {
          // when remove-watchlater for watchlater tab, remove this card
          if (!targetState) {
            await delay(250) // IconAnimatedChecked 200ms
            onRemoveCurrent?.(item, cardData)
          }
        }

        // 其他 Tab
        else {
          antMessage.success(`已${targetState ? '添加' : '移除'}稍后再看`)
        }
      }

      return { success, targetState }
    },
  )

  const addSize = 20
  const addedSize = 18
  const icon = (() => {
    if ($req.loading) {
      return <IconForLoading className='size-16px' />
    }

    if (item.api === EApiType.Watchlater) {
      return watchlaterAdded ? (
        <IconMaterialSymbolsDeleteOutlineRounded className='size-16px' />
      ) : (
        <IconAnimatedChecked size={addedSize} useAnimation={watchlaterAddedPrevious === true} />
      )
    }

    return watchlaterAdded ? (
      <IconAnimatedChecked size={addedSize} useAnimation={watchlaterAddedPrevious === false} />
    ) : (
      <IconForWatchlater className='size-20px' />
    )
  })()

  const tooltip =
    item.api === EApiType.Watchlater
      ? watchlaterAdded
        ? '已添加稍后再看, 点击移除'
        : '已移除稍后再看'
      : watchlaterAdded
        ? '已添加稍后再看, 点击移除'
        : '稍后再看'

  const watchlaterButtonEl = hasWatchlaterEntry && (
    <VideoCardActionButton
      visible={actionButtonVisible}
      inlinePosition='right'
      icon={icon}
      tooltip={tooltip}
      onClick={onToggleWatchlater}
    />
  )

  return { watchlaterButtonEl, onToggleWatchlater, watchlaterAdded, hasWatchlaterEntry }
}
