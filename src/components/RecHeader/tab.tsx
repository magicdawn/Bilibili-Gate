import { type OnRefresh } from '$components/RecGrid/useRefresh'
import { HelpInfo } from '$components/_base/HelpInfo'
import { SHOW_DYNAMIC_FEED_ONLY } from '$modules/rec-services/dynamic-feed/store'
import { SHOW_FAV_TAB_ONLY } from '$modules/rec-services/fav/store'
import { SHOW_SPACE_UPLOAD_ONLY } from '$modules/rec-services/space-upload/store'
import { useSettingsSnapshot } from '$modules/settings'
import { checkLoginStatus, useHasLogined } from '$utility/cookie'
import { proxyWithGmStorage } from '$utility/valtio'
import { css } from '@emotion/react'
import { Radio, Segmented } from 'antd'
import type { ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import type { TabConfigItem } from './tab-config'
import { TabConfig, TabIcon, toastNeedLogin } from './tab-config'
import { ALL_TAB_KEYS, CONFIGURABLE_TAB_KEYS, ETab } from './tab-enum'

/**
 * initial tab
 */
export const videoSourceTabState = await proxyWithGmStorage<{ value: ETab }>(
  { value: ETab.AppRecommend },
  `video-source-tab`,
)
if (SHOW_DYNAMIC_FEED_ONLY) {
  videoSourceTabState.value = ETab.DynamicFeed
}
if (SHOW_FAV_TAB_ONLY) {
  videoSourceTabState.value = ETab.Fav
}
if (SHOW_SPACE_UPLOAD_ONLY) {
  videoSourceTabState.value = ETab.SpaceUpload
}

function getSortedTabKeys(customTabKeysOrder: ETab[]) {
  return CONFIGURABLE_TAB_KEYS.slice().sort((a, b) => {
    let aIndex = customTabKeysOrder.indexOf(a)
    let bIndex = customTabKeysOrder.indexOf(b)
    if (aIndex === -1) aIndex = ALL_TAB_KEYS.indexOf(a)
    if (bIndex === -1) bIndex = ALL_TAB_KEYS.indexOf(b)
    return aIndex - bIndex
  })
}

export function useSortedTabKeys() {
  const { customTabKeysOrder } = useSettingsSnapshot()
  return useMemo(() => getSortedTabKeys(customTabKeysOrder), [customTabKeysOrder])
}

export function useCurrentDisplayingTabKeys() {
  const { hidingTabKeys, customTabKeysOrder } = useSettingsSnapshot()
  const logined = useHasLogined()
  const keys = useMemo(() => {
    const tabkeys = getSortedTabKeys(customTabKeysOrder)
    return tabkeys.filter((key) => {
      if (key === ETab.AppRecommend && !logined) {
        return true
      }
      if (key === ETab.DynamicFeed && SHOW_DYNAMIC_FEED_ONLY) {
        return true
      }
      if (key === ETab.Fav && SHOW_FAV_TAB_ONLY) {
        return true
      }
      if (key === ETab.SpaceUpload && !SHOW_SPACE_UPLOAD_ONLY) {
        return false
      }
      return !hidingTabKeys.includes(key)
    })
  }, [hidingTabKeys, customTabKeysOrder, logined])

  // dynamic-feed only
  if (SHOW_DYNAMIC_FEED_ONLY && keys.includes(ETab.DynamicFeed)) {
    return [ETab.DynamicFeed]
  }

  // fav only
  if (SHOW_FAV_TAB_ONLY && keys.includes(ETab.Fav)) {
    return [ETab.Fav]
  }

  // space-upload
  if (SHOW_SPACE_UPLOAD_ONLY) {
    return [ETab.SpaceUpload]
  }

  return keys
}

function useCurrentDisplayingTabConfigList(): ({ key: ETab } & TabConfigItem)[] {
  const keys = useCurrentDisplayingTabKeys()
  return useMemo(() => keys.map((key) => ({ key, ...TabConfig[key] })), [keys])
}

export function useCurrentUsingTab(): ETab {
  const tab = useSnapshot(videoSourceTabState).value
  const displayTabKeys = useCurrentDisplayingTabKeys()
  const logined = useHasLogined()
  const fallbackTab = ETab.AppRecommend

  // invalid
  if (!displayTabKeys.includes(tab)) return fallbackTab

  // not logined
  if (!logined) {
    // 不允许游客访问
    if (!TabConfig[tab].anonymousUsage) {
      return fallbackTab
    }
  }

  return tab
}

const radioBtnCss = css`
  height: 32px;
  line-height: unset;

  &:has(:focus-visible) {
    outline: none;
    outline-offset: unset;
  }

  > .ant-radio-button + span {
    height: 100%;
  }
`

export function VideoSourceTab({ onRefresh }: { onRefresh: OnRefresh }) {
  const logined = useHasLogined()
  const tab = useCurrentUsingTab()
  const currentTabConfigList = useCurrentDisplayingTabConfigList()
  const { __internalRecTabRenderAsSegments } = useSettingsSnapshot()

  const onChangeTab = useMemoizedFn((newTab: ETab) => {
    if (!logined) {
      if (!TabConfig[newTab].anonymousUsage) {
        if (!checkLoginStatus()) {
          return toastNeedLogin()
        }
      }
    }
    videoSourceTabState.value = newTab
  })

  const renderAsRadio = (
    <Radio.Group
      optionType='button'
      buttonStyle='solid'
      size='middle'
      value={tab}
      className='inline-flex items-center overflow-hidden'
      onFocus={(e) => {
        // 不移除 focus, refresh `r` 无法响应
        const target = e.target as HTMLElement
        target.blur()
      }}
      onChange={async (e) => {
        const newValue = e.target.value as ETab
        onChangeTab(newValue)
      }}
    >
      {currentTabConfigList.map(({ key, label }) => (
        <Radio.Button
          css={radioBtnCss}
          className='video-source-tab' // can be used to customize css
          tabIndex={-1}
          value={key}
          key={key}
        >
          <span className='h-full flex items-center line-height-unset'>
            <TabIcon tabKey={key} className='mr-4px' active={key === tab} />
            {label}
          </span>
        </Radio.Button>
      ))}
    </Radio.Group>
  )

  let renderAsSegment: ReactNode
  {
    const options = useMemo(() => {
      return currentTabConfigList.map(({ key, label }) => {
        return {
          value: key,
          label: (
            <div className='flex items-center gap-x-6px'>
              <TabIcon tabKey={key} active={key === tab} />
              {label}
            </div>
          ),
        }
      })
    }, [currentTabConfigList, tab])
    renderAsSegment = <Segmented<ETab> size='middle' options={options} value={tab} onChange={onChangeTab} />
  }

  return (
    <div className='flex-v-center'>
      {__internalRecTabRenderAsSegments ? renderAsSegment : renderAsRadio}
      <HelpInfo className='size-16px ml-6px'>
        <>
          {currentTabConfigList.map(({ key, label, desc, extraHelpInfo }) => (
            <Fragment key={key}>
              <div className='flex items-center h-22px'>
                <TabIcon tabKey={key} className='mr-4px' active />
                {label}: {desc}
              </div>
              {!!extraHelpInfo && extraHelpInfo}
            </Fragment>
          ))}
        </>
      </HelpInfo>
    </div>
  )
}
