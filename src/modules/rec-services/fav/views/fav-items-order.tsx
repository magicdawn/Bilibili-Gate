import clsx from 'clsx'
import { delay } from 'es-toolkit'
import { useMemo, type ComponentRef, type ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { useOnRefresh } from '$components/Recommends/rec.shared'
import {
  IconForDefaultOrder,
  IconForFav,
  IconForPlayer,
  IconForShuffle,
  IconForTimeAsc,
  IconForTimeDesc,
} from '$modules/icon'
import { usePopupContainer } from '$modules/rec-services/_base'
import { GenericOrderSwitcher } from '$modules/rec-services/_shared/generic-order-switcher'
import { FavItemsOrder } from '../fav-enum'
import { favStore, type FavSelectedKeyPrefix } from '../store'

// 需要统一尺寸
const clsIconSize = 'size-16px'

export const FavItemsOrderConfig: Record<FavItemsOrder, { icon: ReactNode; label: ReactNode }> = {
  [FavItemsOrder.Initial]: {
    icon: <IconForDefaultOrder className={clsIconSize} />,
    label: '初始顺序',
  },
  [FavItemsOrder.Shuffle]: {
    icon: <IconForShuffle className={clsIconSize} />,
    label: '随机顺序',
  },
  [FavItemsOrder.PubTimeDesc]: {
    icon: <IconForTimeDesc className={clsIconSize} />,
    label: '最新投稿',
  },
  [FavItemsOrder.PubTimeAsc]: {
    icon: <IconForTimeAsc className={clsIconSize} />,
    label: '最早投稿',
  },
  [FavItemsOrder.PlayCountDesc]: {
    icon: <IconForPlayer className={clsIconSize} />,
    label: '最多播放',
  },
  [FavItemsOrder.CollectCountDesc]: {
    icon: <IconForFav className={clsx(clsIconSize)} />,
    label: '最多收藏',
  },
  [FavItemsOrder.FavTimeDesc]: {
    icon: <IconForTimeDesc className={clsx(clsIconSize)} />,
    label: '最近收藏',
  },
  [FavItemsOrder.FavTimeAsc]: {
    icon: <IconForTimeAsc className={clsx(clsIconSize)} />,
    label: '最早收藏',
  },
}

const MenuItemsConfig: Record<FavSelectedKeyPrefix, (FavItemsOrder | 'divider')[]> = {
  'all': [FavItemsOrder.Initial, FavItemsOrder.Shuffle],
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
    FavItemsOrder.Initial,
    FavItemsOrder.PubTimeDesc,
    FavItemsOrder.PlayCountDesc,
    FavItemsOrder.CollectCountDesc,
    'divider',
    FavItemsOrder.PubTimeAsc,
    'divider',
    FavItemsOrder.Shuffle,
  ] as const,
}

function _getSelectedKeyPrefix(selectedKey: string) {
  const prefix = selectedKey.split(':')[0] as FavSelectedKeyPrefix
  return prefix
}

function getMenuItemsFor(selectedKey: string) {
  const prefix = _getSelectedKeyPrefix(selectedKey)
  return MenuItemsConfig[prefix] || Object.values(FavItemsOrder)
}

function _getFallbackOrder(selectedKey: string) {
  const prefix = _getSelectedKeyPrefix(selectedKey)
  if (prefix === 'fav-folder') return FavItemsOrder.FavTimeDesc
  if (prefix === 'fav-collection') return FavItemsOrder.PubTimeDesc
  return FavItemsOrder.Initial
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
  const onRefresh = useOnRefresh()
  const { ref: popupRef, getPopupContainer } = usePopupContainer<ComponentRef<'span'>>()

  const { selectedKey, savedOrderMap } = useSnapshot(favStore)
  const value = useSavedOrder(selectedKey, savedOrderMap)
  const menuItems = useMemo(() => getMenuItemsFor(selectedKey), [selectedKey])

  return (
    <GenericOrderSwitcher<FavItemsOrder>
      value={value}
      onChange={async (next) => {
        favStore.savedOrderMap.set(selectedKey, next)
        await delay(100)
        onRefresh()
      }}
      list={menuItems}
      listDisplayConfig={FavItemsOrderConfig}
      $ref={popupRef}
      dropdownProps={{ getPopupContainer }}
    />
  )
}
