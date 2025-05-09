import { reusePendingPromise } from '$utility/async'
import { proxy } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { defaultRankTab, getRankTabsConfig, type IRankTab } from './rank-tab'

const storageKey = 'rank-store-slug'
const initialSlug = (await GM.getValue<string>(storageKey)) || defaultRankTab.slug

export const rankStore = proxy({
  slug: initialSlug,
  tabs: [] as IRankTab[],
  get currentTab() {
    return this.tabs.find((x) => x.slug === this.slug) || defaultRankTab
  },
})

export const updateRankTabs = reusePendingPromise(async () => {
  if (rankStore.tabs.length) return
  const rankTabs = await getRankTabsConfig()
  rankStore.tabs = rankTabs
})

subscribeKey(rankStore, 'slug', () => {
  GM.setValue(storageKey, rankStore.slug)
})
