import { css } from '@emotion/react'
import { ConfigProvider } from 'antd'
import { borderColorValue } from '$components/css-vars'
import { ETab } from '$components/RecHeader/tab-enum'
import { $headerHeight } from '$header'
import { useDynamicFeedScopeSelectDisplayForm } from '$modules/rec-services/dynamic-feed/views'
import { useSettingsSnapshot } from '$modules/settings'

function useShowSidebarViewWrapper(tab: ETab) {
  const { enableSidebar } = useSettingsSnapshot()

  // tab specific logic
  const dynamicFeedScopeSelectForm = useDynamicFeedScopeSelectDisplayForm()

  return useMemo(() => {
    // main switch
    if (!enableSidebar) return false

    // Tab may have sidebarView
    if (![ETab.DynamicFeed, ETab.Fav, ETab.Hot].includes(tab)) return false

    // tab specific
    if (tab === ETab.DynamicFeed) return dynamicFeedScopeSelectForm === 'sidebar'
    // TODO: fav 同理

    return true
  }, [enableSidebar, tab, dynamicFeedScopeSelectForm])
}

export function useSidebarRelated({ tab, sidebarView }: { sidebarView: ReactNode; tab: ETab }) {
  const enabled = useShowSidebarViewWrapper(tab)
  const headerHeight = $headerHeight.use()
  const sidebarEl: ReactNode = enabled && sidebarView && (
    <div
      css={css`
        position: sticky;
        top: ${headerHeight + 55}px;
        max-height: calc(95vh - ${headerHeight + 55}px);
        border: 1px solid ${borderColorValue};
        border-radius: 15px;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-gutter: stable;
        width: 250px;
      `}
    >
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

  return { sidebarEl }
}
