import { Segmented } from 'antd'
import { fastSortWithRules, type FastSortRule } from 'fast-sort-lens'
import { isFavFolderDefault } from '$modules/rec-services/fav/fav-util'
import { mapNameForSort, zhLocaleComparer } from '$utility/sort'
import { assertNever } from '$utility/type'
import type { ComponentProps } from 'react'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

export type FavFolderOrder = 'default' | 'name' | 'count'

function mapFavFolderTitleForSort(title: string) {
  title = title.replace(/^[\s\p{RGI_Emoji}]+/v, '') // rm leading space & emoji
  title = mapNameForSort(title)
  return title
}

export function sortFavFolders(originalFolders: FavFolder[], order: FavFolderOrder) {
  const ruleDefaultFirst: FastSortRule<FavFolder> = { prop: (f) => (isFavFolderDefault(f.attr) ? 1 : 0), order: 'desc' }
  const ruleByNameAsc: FastSortRule<FavFolder> = {
    prop: (f) => mapFavFolderTitleForSort(f.title),
    order: zhLocaleComparer,
  }
  const ruleByCountDesc: FastSortRule<FavFolder> = { prop: 'media_count', order: 'desc' }

  if (order === 'default') return originalFolders
  if (order === 'name') return fastSortWithRules(originalFolders, [ruleDefaultFirst, ruleByNameAsc])
  if (order === 'count') return fastSortWithRules(originalFolders, [ruleDefaultFirst, ruleByCountDesc, ruleByNameAsc])

  assertNever(order)
}

export function FavFolderOrderSwitcher(props: Omit<ComponentProps<typeof Segmented<FavFolderOrder>>, 'options'>) {
  return (
    <Segmented<FavFolderOrder>
      size='middle'
      options={[
        { label: '默认', value: 'default' },
        { label: '名称', value: 'name' },
        { label: '数量', value: 'count' },
      ]}
      {...props}
    />
  )
}
