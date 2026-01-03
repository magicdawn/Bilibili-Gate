import { useMemoizedFn } from 'ahooks'
import clsx from 'clsx'
import { handleMultiSelectWithShiftKey } from '$components/RecGrid/rec-grid-state'
import { multiSelectStore } from '$modules/multi-select/store'
import { clsZMultiSelectBg } from '../index.shared'
import type { MouseEvent } from 'react'

export const IconForMultiSelectUnchecked = IconLucideCircle
export const IconForMultiSelectChecked = IconLucideCircleCheck

export function useMultiSelectRelated({
  multiSelecting,
  multiSelected,
  uniqId,
}: {
  multiSelecting: boolean
  multiSelected: boolean
  uniqId: string
}) {
  const toggleMultiSelect = useMemoizedFn((e?: MouseEvent) => {
    const { selectedIdSet, multiSelecting } = multiSelectStore
    if (!multiSelecting) return

    e?.preventDefault()
    e?.stopPropagation()
    const shiftSelecting = !!e?.shiftKey

    // init anchor, set to first click
    multiSelectStore.shiftMultiSelectAnchorUniqId ??= uniqId
    // update anchor
    if (!shiftSelecting) {
      multiSelectStore.shiftMultiSelectAnchorUniqId = uniqId
    }

    if (shiftSelecting) {
      // shift select
      handleMultiSelectWithShiftKey(multiSelectStore.shiftMultiSelectAnchorUniqId, uniqId)
    } else {
      // toggle current
      multiSelected ? selectedIdSet.delete(uniqId) : selectedIdSet.add(uniqId)
    }
  })

  const multiSelectBgEl = multiSelecting && (
    <div
      onClick={toggleMultiSelect}
      className={clsx('absolute inset-0 flex items-center justify-center bg-black/10', clsZMultiSelectBg)}
    />
  )

  const Icon = multiSelected ? IconForMultiSelectChecked : IconForMultiSelectUnchecked
  const multiSelectEl = multiSelecting && (
    <Icon
      onClick={toggleMultiSelect}
      className={clsx(
        'size-30px cursor-pointer text-white [&_g]:fill-inherit',
        multiSelected ? 'fill-gate-primary' : 'fill-none',
      )}
    />
  )

  return {
    toggleMultiSelect,
    multiSelectBgEl,
    multiSelectEl,
  }
}
