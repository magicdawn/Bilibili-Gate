import { css } from '@emotion/react'
import { ConfigProvider } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { QUERY_DYNAMIC_UP_MID } from '$modules/rec-services/dynamic-feed/store'
import { hotStore } from '$modules/rec-services/hot'
import { useSettingsSnapshot } from '$modules/settings'
import { useGridDisplayModeChecker } from './display-mode'
import { GridConfigContext } from '.'
import type { CSSProperties, ReactNode } from 'react'

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
  const { insideModal } = useContext(GridConfigContext)

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
  viewTab,
}: {
  className?: string
  style?: CSSProperties
  sidebarView: ReactNode
  viewTab: ETab | undefined
}) {
  const visible = useSidebarVisible(viewTab)

  const usingClassName = useUnoMerge(
    'h-fit w-250px flex-none overflow-x-hidden overflow-y-auto b-1px b-gate-bg-lv2 rounded-15px b-solid',
    useTabExtraClassName(viewTab),
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
