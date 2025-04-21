import { multiSelectStore } from '$modules/multi-select/store'
import { css } from '@emotion/css'
import type { SyntheticEvent } from 'react'
import { zIndexMultiSelectBg } from '../index.module.scss'

export const IconForMultiSelectUnchecked = IconLucideCircle
export const IconForMultiSelectChecked = IconLucideCircleCheck

const clsForIconChecked = css`
  g {
    fill: inherit;
  }
`

export function useMultiSelectRelated({
  multiSelecting,
  multiSelected,
  uniqId,
}: {
  multiSelecting: boolean
  multiSelected: boolean
  uniqId: string
}) {
  const toggleMultiSelect = useMemoizedFn((e?: SyntheticEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (multiSelected) {
      multiSelectStore.selectedIdSet.delete(uniqId)
    } else {
      multiSelectStore.selectedIdSet.add(uniqId)
    }
  })

  const multiSelectBgEl = multiSelecting && (
    <div
      onClick={toggleMultiSelect}
      className='absolute inset-0 flex items-center justify-center bg-black/10'
      css={css`
        z-index: ${zIndexMultiSelectBg};
      `}
    />
  )

  const Icon = multiSelected ? IconForMultiSelectChecked : IconForMultiSelectUnchecked
  const multiSelectEl = multiSelecting && (
    <Icon
      onClick={toggleMultiSelect}
      className={clsx(
        clsForIconChecked,
        'size-30px cursor-pointer text-white',
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
