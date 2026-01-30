import type { ReactNode } from 'react'
import type { EApiType } from '$define/index.shared'
import type { FavCollectionDetailInfo, FavCollectionDetailMedia } from './collections/collection-detail'
import type { FavFolderDetailInfo, FavFolderDetailMedia } from './folders/list-folder-items'

export type FavItem =
  | (FavFolderDetailMedia & {
      from: 'fav-folder'
      folder: FavFolderDetailInfo
    })
  | (FavCollectionDetailMedia & {
      from: 'fav-collection'
      collection: FavCollectionDetailInfo
    })

export type FavItemExtend = FavItem & {
  api: EApiType.Fav
  uniqId: string
  vol?: number
  volTooltip?: ReactNode
}
