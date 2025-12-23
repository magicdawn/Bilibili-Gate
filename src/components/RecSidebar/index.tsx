import { css } from '@emotion/react'
import { ConfigProvider } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { hotStore } from '$modules/rec-services/hot'
import { useSidebarVisible } from './sidebar-shared'

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

function useTabExtraClassName(tab: ETab | undefined): string | undefined {
  const hotSubTab = useSnapshot(hotStore).subtab
  if (tab === ETab.Fav) return 'w-300px'
  if (tab === ETab.Hot && hotSubTab === EHotSubTab.Rank) return 'w-200px'
}

export function RecSidebar({
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
