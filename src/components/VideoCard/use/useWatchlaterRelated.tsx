import { type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { IconForWatchlater } from '$modules/icon'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { watchlaterState } from '$modules/rec-services/watchlater'
import { antMessage } from '$utility/antd'
import { usePrevious, useRequest } from 'ahooks'
import { delay } from 'es-toolkit'
import { size } from 'polished'
import type { MouseEvent } from 'react'
import type { VideoCardInnerProps } from '..'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import type { IVideoCardData } from '../process/normalize'
import { watchlaterAdd, watchlaterDel } from '../services'

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
  const hasWatchlaterEntry = (() => {
    if (item.api === EApiType.AppRecommend) {
      return item.goto === 'av'
    }
    if (item.api === EApiType.Ranking) {
      return cardData.goto === 'av'
    }
    if (item.api === EApiType.Live) {
      return false
    }
    return true
  })()

  const $req = useRequest(
    (usingAction: typeof watchlaterAdd | typeof watchlaterDel, avid: string) => usingAction(avid),
    { manual: true },
  )

  // watchlater added
  const watchlaterAddedPrevious = usePrevious(watchlaterAdded)

  const onToggleWatchlater = useMemoizedFn(
    async (
      e?: MouseEvent,
      usingAction?: typeof watchlaterDel | typeof watchlaterAdd,
    ): Promise<{ success: boolean; targetState?: boolean }> => {
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
            await delay(1000)
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
      return <IconSvgSpinnersBarsRotateFade {...size(16)} />
    }

    if (item.api === EApiType.Watchlater) {
      return watchlaterAdded ? (
        <IconMaterialSymbolsDeleteOutlineRounded {...size(16)} />
      ) : (
        <IconAnimatedChecked size={addedSize} useAnimation={watchlaterAddedPrevious === true} />
      )
    }

    return watchlaterAdded ? (
      <IconAnimatedChecked size={addedSize} useAnimation={watchlaterAddedPrevious === false} />
    ) : (
      <IconForWatchlater {...size(addSize)} />
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
