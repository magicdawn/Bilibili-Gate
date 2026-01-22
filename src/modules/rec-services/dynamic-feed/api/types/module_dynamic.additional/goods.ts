import type { DynamicFeedEnums } from '../../enums'

export interface AdditionalTypeGoods {
  type: DynamicFeedEnums.AdditionalType.Goods
  goods: Goods
}

export interface Goods {
  head_icon: string
  head_text: string
  items: GoodsItem[]
  jump_url: string
}

export interface GoodsItem {
  brief: string
  cover: string
  id: number
  jump_desc: string
  jump_url: string
  name: string
  price: string
}
