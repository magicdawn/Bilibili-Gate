import { css } from '@emotion/react'
import { Tabs } from 'antd'
import { get, set } from 'es-toolkit/compat'
import { proxy, useSnapshot } from 'valtio'
import { __PROD__ } from '$common'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { antMessage } from '$modules/antd'
import { IconForConfig } from '$modules/icon'
import { settings, type BooleanSettingsPath } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { TabPaneAdvance } from './tab-panes/pane-advance'
import { TabPaneBasic } from './tab-panes/pane-basic'
import { TabPaneCustomUI, useHotkeyForConfigBorder } from './tab-panes/pane-custom-ui'
import { TabPaneFilter } from './tab-panes/pane-filter'
import { TabPaneOtherPages } from './tab-panes/pane-other-pages'
import { TabPaneRecTabsConfig } from './tab-panes/pane-rec-tab-config'
import { sharedClassNames } from './tab-panes/shared'
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
  OtherPages = 'other-pages',
  Advance = 'advance',
}

const tab = __PROD__
  ? TabPaneKey.Basic
  : // for debug, free to change this
    TabPaneKey.Basic
const modalSettingsStore = proxy({ tab })

// empty component for conditional render
export function ModalSettingsHotkey() {
  useHotkeyForConfig(['shift.p'], 'videoCard.imgPreview.autoPreviewWhenKeyboardSelect', '键盘选中后自动开始预览')
  useHotkeyForConfig(['shift.m'], 'videoCard.imgPreview.autoPreviewWhenHover', '鼠标悬浮后自动开始预览')
  useHotkeyForConfigBorder()
  return null
}

const customTabsCss = css`
  &.ant-tabs {
    .ant-tabs-tab {
      justify-content: end;
      padding-inline: 5px 15px; /* 8 24 */
    }

    /* https://github.com/ant-design/ant-design/issues/43541 */
    .ant-tabs-nav-operations {
      display: none;
    }
  }
`

export function ModalSettings({ show, onHide }: { show: boolean; onHide: () => void }) {
  const { tab } = useSnapshot(modalSettingsStore)

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      hideWhenMaskOnClick={true}
      hideWhenEsc={true}
      width={900}
      clsModal='max-h-unset'
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
          tabPlacement='start'
          size='middle'
          css={customTabsCss}
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
                <div className={sharedClassNames.tabPane}>
                  <ThemesSelect />
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
              label: '其他页面',
              key: TabPaneKey.OtherPages,
              children: <TabPaneOtherPages />,
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
