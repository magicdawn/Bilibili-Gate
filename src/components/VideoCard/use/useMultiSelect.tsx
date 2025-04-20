import { colorPrimaryValue } from '$components/css-vars'
import { multiSelectStore } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { css } from '@emotion/react'
import type { SyntheticEvent } from 'react'
import { zIndexMultiSelectBg } from '../index.module.scss'

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

  const multiSelectBgEl = multiSelecting && (
    <div
      onClick={toggleMultiSelect}
      className='absolute inset-0 flex items-center justify-center bg-black/10'
      css={css`
        z-index: ${zIndexMultiSelectBg};
      `}
    />
  )

  const iconClassName = 'size-30px'
  const iconCss = css`
    color: ${multiSelected ? colorPrimaryValue : '#fff'};
  `
  const multiSelectEl = multiSelecting && (
    <>
      {multiSelected ? (
        <IconForMultiSelectChecked className={iconClassName} css={iconCss} />
      ) : (
        <IconForMultiSelectUnchecked className={iconClassName} css={iconCss} />
      )}
    </>
  )

  return {
    toggleMultiSelect,
    multiSelectBgEl,
    multiSelectEl,
  }
}
