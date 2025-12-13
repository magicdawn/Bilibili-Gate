import type { EApiType } from '$define/index.shared'
import type { FavCollectionDetailInfo, FavCollectionDetailMedia } from './collections/collection-detail'
import type { FavFolderDetailInfo, FavFolderDetailMedia } from './folders/list-folder-items'
import type { ReactNode } from 'react'

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
  uniqId: string
  api: EApiType.Fav
  vol?: number
  volTooltip?: ReactNode
}
