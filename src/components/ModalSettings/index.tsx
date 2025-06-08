import { css } from '@emotion/react'
import { Tabs } from 'antd'
import { get, set } from 'es-toolkit/compat'
import { proxy, useSnapshot } from 'valtio'
import { __PROD__ } from '$common'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { antMessage } from '$modules/antd'
import { useHotkeyForToggleEvolvedDarkMode } from '$modules/dark-mode'
import { IconForConfig } from '$modules/icon'
import { settings } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import type { BooleanSettingsPath } from '$modules/settings'
import { TabPaneAdvance } from './tab-panes/pane-advance'
import { TabPaneBasic } from './tab-panes/pane-basic'
import { TabPaneCustomUI, useHotkeyForConfigBorder } from './tab-panes/pane-custom-ui'
import { TabPaneFilter } from './tab-panes/pane-filter'
import { TabPaneRecTabsConfig } from './tab-panes/pane-rec-tab-config'
import { SettingsGroup, sharedCss } from './tab-panes/shared'
import { ThemesSelect } from './theme'

function useHotkeyForConfig(hotkey: string | string[], configPath: BooleanSettingsPath, label: string) {
  return useKeyPress(
    hotkey,
    (e) => {
      if (shouldDisableShortcut()) return
      const current = Boolean(get(settings, configPath))
      const newValue = !current
      set(settings, configPath, newValue)
      antMessage.success(`已${newValue ? '启用' : '禁用'}「${label}」`)
    },
    { exactMatch: true },
  )
}

const enum TabPaneKey {
  Basic = 'basic',
  Filter = 'filter',
  CustomUi = 'custom-ui',
  ThemeSelect = 'theme-select',
  VideoSourceTabConfig = 'video-source-tab-config',
  Advance = 'advance',
}

const tab = __PROD__
  ? TabPaneKey.Basic
  : // for debug, free to change this
    TabPaneKey.Basic
const modalSettingsStore = proxy({ tab })

// empty component for conditional render
export function ModalSettingsHotkey() {
  useHotkeyForConfig(['shift.p'], 'autoPreviewWhenKeyboardSelect', '键盘选中后自动开始预览')
  useHotkeyForConfig(['shift.m'], 'autoPreviewWhenHover', '鼠标悬浮后自动开始预览')
  useHotkeyForConfig(['shift.c'], 'useNarrowMode', '居中模式')
  useHotkeyForConfigBorder()
  useHotkeyForToggleEvolvedDarkMode()
  return null
}

export function ModalSettings({ show, onHide }: { show: boolean; onHide: () => void }) {
  const { tab } = useSnapshot(modalSettingsStore)

  return (
    <BaseModal
      {...{
        show,
        onHide,
        hideWhenMaskOnClick: true,
        hideWhenEsc: true,
        cssModal: css`
          width: 900px;
          max-height: unset;
        `,
      }}
    >
      <div className={BaseModalClassNames.modalHeader}>
        <div className={BaseModalClassNames.modalTitle}>
          <IconForConfig className='mr-4px mt--2px size-26px' />
          设置
        </div>
        <ModalClose onClick={onHide} />
      </div>

      {/* issue 设置项里面的滚动条怎么是双份的 */}
      <main className={BaseModalClassNames.modalBody} style={{ overflow: 'hidden' }}>
        <Tabs
          tabPosition='left'
          size='middle'
          css={css`
            &.ant-tabs {
              .ant-tabs-tab {
                justify-content: end;
                /* 8 24 */
                padding-inline: 5px 15px;
                /* --ant-tabs-vertical-item-margin: 10px 0 0 0; */
              }

              /* https://github.com/ant-design/ant-design/issues/43541 */
              .ant-tabs-nav-operations {
                display: none;
              }
            }
          `}
          activeKey={tab}
          onChange={(tab) => (modalSettingsStore.tab = tab as TabPaneKey)}
          items={[
            {
              label: '常规设置',
              key: TabPaneKey.Basic,
              children: <TabPaneBasic />,
            },
            {
              label: '内容过滤',
              key: TabPaneKey.Filter,
              children: <TabPaneFilter />,
            },
            {
              label: '主题选择',
              key: TabPaneKey.ThemeSelect,
              children: (
                <div css={sharedCss.tabPane}>
                  <SettingsGroup title='主题选择'>
                    <ThemesSelect />
                  </SettingsGroup>
                </div>
              ),
            },
            {
              label: '样式自定',
              key: TabPaneKey.CustomUi,
              children: <TabPaneCustomUI />,
            },
            {
              label: 'Tab 设置',
              key: TabPaneKey.VideoSourceTabConfig,
              children: <TabPaneRecTabsConfig />,
            },
            {
              label: '高级设置',
              key: TabPaneKey.Advance,
              children: <TabPaneAdvance />,
            },
          ]}
        />
      </main>
    </BaseModal>
  )
}
