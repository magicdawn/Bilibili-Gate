import { Divider, type Menu } from 'antd'
import { useSnapshot } from 'valtio/react'
import { useGridDisplayModeChecker } from '$components/RecGrid/display-mode'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { useRecSelfContext } from '$components/Recommends/rec.shared'
import { QUERY_DYNAMIC_UP_MID } from '$modules/rec-services/dynamic-feed/store'
import { hotStore } from '$modules/rec-services/hot'
import { useSettingsSnapshot } from '$modules/settings'
import type { AntMenuItem } from '$modules/antd'
import type { ElementRef } from 'react'

export const sidebarBottomLine = (
  <Divider className='[&.ant-divider-horizontal.ant-divider-with-text]:(my-5px text-14px)'>底线</Divider>
)

export function useSidebarVisible(tab: ETab | undefined): boolean {
  const { enableSidebar } = useSettingsSnapshot()
  const { usingTwoColumnMode } = useGridDisplayModeChecker()
  const hotSubTab = useSnapshot(hotStore).subtab
  const { insideModal } = useRecSelfContext()

  return useMemo(() => {
    if (!enableSidebar) return false // main switch
    if (insideModal && usingTwoColumnMode) return false // disable sidebar in Modal+TwoColumnMode

    // tab specific
    if (tab === ETab.DynamicFeed) {
      if (QUERY_DYNAMIC_UP_MID) return false
      return true
    }
    if (tab === ETab.Hot) return hotSubTab === EHotSubTab.Rank
    if (tab === ETab.Fav) return true
    return false
  }, [tab, enableSidebar, hotSubTab, insideModal, usingTwoColumnMode])
}

export function useRevealMenuSelectedKey(menuItems: AntMenuItem[], selectedKey: string) {
  const menuRef = useRef<ElementRef<typeof Menu>>(null)

  const revealSelected = useMemoizedFn((key?: string) => {
    key ||= selectedKey
    if (!key) return
    const el = menuRef.current?.menu?.findItem({ key })
    if (!el) return
    el.scrollIntoViewIfNeeded ? el.scrollIntoViewIfNeeded() : el.scrollIntoView()
    return true // mark scroll called
  })

  /**
   * Auto reveal on load
   */
  const scrollCalled = useRef(false)
  const checkAndScroll = useMemoizedFn(() => {
    if (scrollCalled.current) return
    const called = revealSelected()
    if (called) {
      scrollCalled.current = true
    }
  })
  useMount(() => checkAndScroll())
  useUpdateEffect(() => checkAndScroll(), [menuItems])

  return { menuRef, revealSelected }
}
