import { useMemoizedFn, usePrevious, useRequest } from 'ahooks'
import { delay } from 'es-toolkit'
import { useMemo, type MouseEvent } from 'react'
import { checkIsAppRecommend, checkIsLive, checkIsPcRecommend, checkIsRank, type RecItemType } from '$define'
import { EApiType } from '$enums'
import { antMessage } from '$modules/antd'
import { IconAnimatedChecked, IconForDelete, IconForLoading, IconForWatchlater } from '$modules/icon'
import { watchlaterState } from '$modules/rec-services/watchlater'
import { handleRequestError } from '$request'
import { VideoCardActionButton } from '../child-components/VideoCardActions'
import { watchlaterAdd, watchlaterDel } from '../services'
import type { IVideoCardData } from '$modules/filter/normalize'
import type { VideoCardInnerProps } from '..'

export type WatchlaterRelatedContext = ReturnType<typeof useWatchlaterRelated>['context']

export type WatchlaterAction = 'add' | 'del' | 'toggle'

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
    if (checkIsAppRecommend(item) || checkIsPcRecommend(item)) {
      return item.goto === 'av'
    }
    if (checkIsRank(item)) {
      return cardData.goto === 'av'
    }
    if (checkIsLive(item)) {
      return false
    }
    return !!bvid
  }, [item, cardData])

  type WatchlaterApiService = typeof watchlaterAdd | typeof watchlaterDel

  const $req = useRequest((apiService: WatchlaterApiService, avid: string) => apiService(avid), {
    manual: true,
  })

  // watchlater added
  const watchlaterAddedPrevious = usePrevious(watchlaterAdded)

  const runWatchlaterApiService = useMemoizedFn(
    async (apiService: WatchlaterApiService, silentSuccessMessage = false): Promise<boolean> => {
      // already loading
      if ($req.loading) return false
      if (!avid || !bvid) return false

      const result = await $req.runAsync(apiService, avid)
      if (result.isErr()) {
        handleRequestError(result.error)
        return false
      }

      const targetState = apiService === watchlaterAdd ? true : false
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
        if (!silentSuccessMessage) {
          antMessage.success(`已${targetState ? '添加' : '移除'}稍后再看`)
        }
      }

      return result.isOk()
    },
  )
  const handleAddWatchlater = useMemoizedFn((silentSuccessMessage?: boolean) =>
    runWatchlaterApiService(watchlaterAdd, silentSuccessMessage),
  )
  const handleDelWatchlater = useMemoizedFn((silentSuccessMessage?: boolean) =>
    runWatchlaterApiService(watchlaterDel, silentSuccessMessage),
  )
  const handleToggleWatchlater = useMemoizedFn((e?: MouseEvent, silentSuccessMessage?: boolean) => {
    e?.preventDefault()
    e?.stopPropagation()
    return runWatchlaterApiService(watchlaterAdded ? watchlaterDel : watchlaterAdd, silentSuccessMessage)
  })

  const addSize = 20
  const addedSize = 18
  const icon = (() => {
    if ($req.loading) {
      return <IconForLoading className='size-16px' />
    }

    if (item.api === EApiType.Watchlater) {
      return watchlaterAdded ? (
        <IconForDelete className='size-18px' />
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
      onClick={handleToggleWatchlater}
    />
  )

  const context = useMemo(() => {
    return {
      watchlaterAdded,
      hasWatchlaterEntry,
      handleToggleWatchlater,
      handleAddWatchlater,
      handleDelWatchlater,
    }
  }, [watchlaterAdded, hasWatchlaterEntry, handleToggleWatchlater, handleAddWatchlater, handleDelWatchlater])

  return { context, watchlaterButtonEl }
}
