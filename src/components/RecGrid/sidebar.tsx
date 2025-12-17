import { css } from '@emotion/react'
import { ConfigProvider, type Menu } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { useRecContext } from '$components/Recommends/rec.shared'
import { QUERY_DYNAMIC_UP_MID } from '$modules/rec-services/dynamic-feed/store'
import { hotStore } from '$modules/rec-services/hot'
import { useSettingsSnapshot } from '$modules/settings'
import type { AntMenuItem } from '$modules/antd'
import { useGridDisplayModeChecker } from './display-mode'
import type { CSSProperties, ElementRef, ReactNode } from 'react'

const sidebarViewWrapperCss = css`
  scrollbar-width: thin;
  /* scrollbar-gutter: stable; */

  .ant-menu-item-group-title {
    padding: 4px 8px;
  }
  .ant-menu-item {
    margin-block: 1px;
  }

  /* required for bilibili.com default style impact */
  ul.ant-menu-item-group-list {
    font-size: inherit;
  }
`

export function useSidebarVisible(tab: ETab | undefined): boolean {
  const { enableSidebar } = useSettingsSnapshot()
  const { usingTwoColumnMode } = useGridDisplayModeChecker()
  const hotSubTab = useSnapshot(hotStore).subtab
  const { insideModal } = useRecContext()

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

function useTabExtraClassName(tab: ETab | undefined): string | undefined {
  const hotSubTab = useSnapshot(hotStore).subtab
  if (tab === ETab.Fav) return 'w-300px'
  if (tab === ETab.Hot && hotSubTab === EHotSubTab.Rank) return 'w-200px'
}

export function GridSidebar({
  className: propClassName,
  style: propStyle,
  sidebarView,
  tab,
}: {
  className?: string
  style?: CSSProperties
  sidebarView: ReactNode
  tab: ETab
}) {
  const visible = useSidebarVisible(tab)

  const usingClassName = useUnoMerge(
    'h-fit w-250px flex-none overflow-x-hidden overflow-y-auto b-1px b-gate-border rounded-15px b-solid',
    useTabExtraClassName(tab),
    propClassName,
  )

  return (
    visible &&
    sidebarView && (
      <div className={usingClassName} css={sidebarViewWrapperCss} style={propStyle}>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemHeight: 30,
              },
            },
          }}
        >
          {sidebarView}
        </ConfigProvider>
      </div>
    )
  )
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
