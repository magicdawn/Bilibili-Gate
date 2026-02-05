import { fastOrderBy } from 'fast-sort-lens'
import { isFavFolderDefault } from '$modules/rec-services/fav/fav-util'
import { mapNameForSort, zhLocaleComparer } from '$utility/sort'
import type { FavFolder } from '$modules/rec-services/fav/types/folders/list-all-folders'

export type FavFolderOrder = 'default' | 'name'

function mapFavFolderTitleForSort(title: string) {
  title = title.replace(/^[\s\p{RGI_Emoji}]+/v, '') // rm leading space & emoji
  title = mapNameForSort(title)
  return title
}

export function sortFavFoldersByName(folders: FavFolder[]) {
  return fastOrderBy(
    folders,
    [(f) => (isFavFolderDefault(f.attr) ? 1 : 0), (f) => mapFavFolderTitleForSort(f.title)],
    ['desc', zhLocaleComparer],
  )
}
