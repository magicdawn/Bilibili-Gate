import { useSnapshot } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { isAppRecommend, isPcRecommend, type RecItemType } from '$define'
import type { DislikeReason } from './types'

export const dislikedMap = proxyMap<string, DislikeReason>()

export function useDislikedReason(id: string | undefined) {
  const map = useSnapshot(dislikedMap)
  return id ? map.get(id) : undefined
}

export function delDisliked(id: string) {
  dislikedMap.delete(id)
}

export function calcRecItemDislikedMapKey(item: RecItemType) {
  if (isAppRecommend(item)) return item.param
  if (isPcRecommend(item)) return item.id.toString()
}
