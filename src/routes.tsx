import { ETab } from '$components/RecHeader/tab-enum'
import { SHOW_DYNAMIC_FEED_ONLY } from '$modules/rec-services/dynamic-feed/store'
import { SHOW_FAV_TAB_ONLY } from '$modules/rec-services/fav/store'
import { SHOW_SPACE_UPLOAD_ONLY } from '$modules/rec-services/space-upload/store'

export function getOnlyTab() {
  if (SHOW_DYNAMIC_FEED_ONLY) return ETab.DynamicFeed
  if (SHOW_FAV_TAB_ONLY) return ETab.Fav
  if (SHOW_SPACE_UPLOAD_ONLY) return ETab.SpaceUpload
  if (searchParams.get(GateQueryKey.Tab)) return searchParams.get(GateQueryKey.Tab) as ETab
}

export enum GateQueryKey {
  MainSwitch = 'gate',
  Tab = 'gate-tab',
}

export const searchParams = new URL(location.href).searchParams

export function inGateEntry() {
  return searchParams.has(GateQueryKey.MainSwitch)
}

export function getGateEntryHref() {
  const u = new URL(location.href)
  u.search = ''
  u.searchParams.set(GateQueryKey.MainSwitch, '1')
  return u.href
}
