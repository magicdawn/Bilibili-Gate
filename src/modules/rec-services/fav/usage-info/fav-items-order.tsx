import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import {
  IconForDefaultOrder,
  IconForFav,
  IconForPlayer,
  IconForShuffle,
  IconForTimestamp,
  withAscIcon,
  withDescIcon,
} from '$modules/icon'
import { usePopupContainer } from '$modules/rec-services/_base'
import { GenericOrderSwitcher } from '$modules/rec-services/_shared/generic-order-switcher'
import { delay } from 'es-toolkit'
import type { ComponentRef, ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { FavItemsOrder } from '../fav-enum'
import { favStore, type FavSelectedKeyPrefix } from '../store'

// 需要统一尺寸
const clsIconSize = 'size-16px'

export const FavItemsOrderConfig: Record<FavItemsOrder, { icon: ReactNode; label: ReactNode }> = {
  [FavItemsOrder.Default]: {
    icon: <IconForDefaultOrder className={clsIconSize} />,
    label: '默认顺序',
  },
  [FavItemsOrder.Shuffle]: {
    icon: <IconForShuffle className={clsIconSize} />,
    label: '随机顺序',
  },
  [FavItemsOrder.PubTimeDesc]: {
    icon: <IconForTimestamp className={clsIconSize} />,
    label: withDescIcon('最新投稿'),
  },
  [FavItemsOrder.PubTimeAsc]: {
    icon: <IconForTimestamp className={clsIconSize} />,
    label: withAscIcon('最早投稿'),
  },
  [FavItemsOrder.PlayCountDesc]: {
    icon: <IconForPlayer className={clsIconSize} />,
    label: withDescIcon('最多播放'),
  },
  [FavItemsOrder.CollectCountDesc]: {
    icon: <IconForFav className={clsx(clsIconSize, 'mt--1px')} />,
    label: withDescIcon('最多收藏'),
  },
  [FavItemsOrder.FavTimeDesc]: {
    icon: <IconForFav className={clsx(clsIconSize, 'mt--1px')} />,
    label: withDescIcon('最近收藏'),
  },
  [FavItemsOrder.FavTimeAsc]: {
    icon: <IconForFav className={clsx(clsIconSize, 'mt--1px')} />,
    label: withAscIcon('最早收藏'),
  },
}

const MenuItemsConfig: Record<FavSelectedKeyPrefix, (FavItemsOrder | 'divider')[]> = {
  'all': [FavItemsOrder.Default, FavItemsOrder.Shuffle],
  'fav-folder': [
    FavItemsOrder.FavTimeDesc,
    FavItemsOrder.PubTimeDesc,
    FavItemsOrder.PlayCountDesc,
    FavItemsOrder.CollectCountDesc,
    'divider',
    FavItemsOrder.FavTimeAsc,
    FavItemsOrder.PubTimeAsc,
    'divider',
    FavItemsOrder.Shuffle,
  ] as const,
  'fav-collection': [
    FavItemsOrder.Default,
    FavItemsOrder.PubTimeDesc,
    FavItemsOrder.PlayCountDesc,
    FavItemsOrder.CollectCountDesc,
    'divider',
    FavItemsOrder.PubTimeAsc,
    'divider',
    FavItemsOrder.Shuffle,
  ] as const,
}

function getMenuItemsFor(selectedKey: string) {
  const prefix = selectedKey.split(':')[0] as FavSelectedKeyPrefix
  return MenuItemsConfig[prefix] || Object.values(FavItemsOrder)
}

function _getFallbackOrder(selectedKey: string) {
  if (selectedKey.startsWith('fav-folder:')) return FavItemsOrder.FavTimeDesc
  return FavItemsOrder.Default
}

/**
 * current: load then validate
 */
export function getSavedOrder(selectedKey: string, savedOrderMap: Map<string, FavItemsOrder>) {
  const allowed = getMenuItemsFor(selectedKey).filter((x) => x !== 'divider')
  const current = savedOrderMap.get(selectedKey) || _getFallbackOrder(selectedKey)
  if (allowed.includes(current)) return current
  return _getFallbackOrder(selectedKey)
}
export function useSavedOrder(selectedKey: string, savedOrderMap: Map<string, FavItemsOrder>) {
  return useMemo(() => getSavedOrder(selectedKey, savedOrderMap), [savedOrderMap, selectedKey])
}

export function FavItemsOrderSwitcher() {
  const onRefresh = useOnRefreshContext()
  const { ref, getPopupContainer } = usePopupContainer<ComponentRef<'span'>>()

  const { selectedKey, savedOrderMap } = useSnapshot(favStore)
  const value = useSavedOrder(selectedKey, savedOrderMap)
  const menuItems = useMemo(() => getMenuItemsFor(selectedKey), [selectedKey])

  return (
    <GenericOrderSwitcher<FavItemsOrder>
      value={value}
      onChange={async (next) => {
        favStore.savedOrderMap.set(selectedKey, next)
        await delay(100)
        onRefresh?.()
      }}
      list={menuItems}
      listDisplayConfig={FavItemsOrderConfig}
      $ref={ref}
      dropdownProps={{ getPopupContainer }}
    />
  )
}
