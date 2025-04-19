import { colorPrimaryValue } from '$components/css-vars'
import { multiSelectStore } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { css } from '@emotion/react'
import type { SyntheticEvent } from 'react'
import { zIndexMultiSelect } from '../index.module.scss'

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
  const toggleMultiSelect = useMemoizedFn((e?: SyntheticEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    if (multiSelected) {
      multiSelectStore.selectedIdSet.delete(uniqId)
    } else {
      multiSelectStore.selectedIdSet.add(uniqId)
    }
  })

  const iconClassName = 'size-30px absolute left-10px top-10px'
  const multiSelectEl = (
    <>
      {multiSelecting && (
        <div
          className='absolute inset-0 flex items-center justify-center bg-black/20'
          css={css`
            z-index: ${zIndexMultiSelect};
            color: ${multiSelected ? colorPrimaryValue : '#fff'};
          `}
          onClick={toggleMultiSelect}
        >
          {multiSelected ? (
            <IconForMultiSelectChecked className={iconClassName} />
          ) : (
            <IconForMultiSelectUnchecked className={iconClassName} />
          )}
        </div>
      )}
    </>
  )

  return {
    toggleMultiSelect,
    multiSelectEl,
  }
}
