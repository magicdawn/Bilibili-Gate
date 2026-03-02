import { Button, Popconfirm, Space } from 'antd'
import clsx from 'clsx'
import { difference, startCase } from 'es-toolkit'
import { useState, type ReactNode } from 'react'
import { APP_NAME } from '$common'
import { buttonOpenCss } from '$common/emotion-css'
import { CollapsePanel } from '$components/_base/CollapsePanel'
import { HelpInfo } from '$components/_base/HelpInfo'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForOpenExternalLink } from '$modules/icon'
import {
  allowedLeafSettingsPaths,
  internalBooleanPaths,
  pickSettings,
  resetSettings,
  runSettingsMigration,
  updateSettings,
  type BooleanSettingsPath,
} from '$modules/settings'
import { exportSettings, importSettings } from '$modules/settings/file-backup'
import { articleDraft, restoreOmitPaths } from '$modules/settings/index.shared'
import { set_HAS_RESTORED_SETTINGS } from '$modules/settings/restore-flag'
import { toastAndReload } from '../index.shared'
import { ResetPartialSettingsButton, SettingsGroup, sharedClassNames } from './shared'

function onResetSettings() {
  resetSettings()
  return toastAndReload()
}

async function onRestoreSettings() {
  const remoteSettings = await articleDraft.getData()
  runSettingsMigration(remoteSettings)
  const { pickedPaths, pickedSettings } = pickSettings(
    remoteSettings,
    difference(allowedLeafSettingsPaths, restoreOmitPaths),
  )
  if (!pickedPaths.length) {
    return antMessage.error('备份不存在或没有有效的配置')
  }

  set_HAS_RESTORED_SETTINGS(true)
  updateSettings(pickedSettings)
  return toastAndReload()
}

export function TabPaneAdvance() {
  const [internalKeysExpanded, setInternalKeysExpanded] = useState<boolean>(false)

  return (
    <div className={sharedClassNames.tabPane}>
      <SettingsGroup title='设置项'>
        <Space size={20}>
          <Popconfirm title='确定' description='确定恢复默认设置? 此操作不可逆!' onConfirm={onResetSettings}>
            <Button danger type='primary'>
              <IconTablerRestore />
              恢复默认设置
            </Button>
          </Popconfirm>

          <Space size={5}>
            <AntdTooltip title='导出所有设置项到文件中, 包含 access_key 等数据, 请妥善保存'>
              <Button onClick={() => exportSettings()}>
                <IconTablerFileExport />
                导出设置
              </Button>
            </AntdTooltip>
            <AntdTooltip title='从文件中导入设置项, 将覆盖当前设置, 此操作不可逆!'>
              <Button onClick={() => importSettings()}>
                <IconTablerFileImport />
                导入设置
              </Button>
            </AntdTooltip>
          </Space>
        </Space>
      </SettingsGroup>

      <SettingsGroup
        title={
          <>
            <IconIcOutlineCloud className='mr-4px size-28px' />
            备份
          </>
        }
      >
        <div className='flex items-center gap-x-40px'>
          <span className='flex items-center gap-x-8px'>
            <CheckboxSettingItem
              configPath='backupSettingsToArticleDraft'
              label='备份设置到专栏草稿箱中'
              tooltip={`专栏 - 草稿箱 - ${APP_NAME}`}
            />
            <a
              className='inline-flex items-center'
              href='https://member.bilibili.com/platform/upload/text/draft'
              target='_blank'
            >
              <IconForOpenExternalLink className='mr-4px size-16px' />
              去草稿箱浏览
            </a>
          </span>

          <Popconfirm title='确定' description='将覆盖本地设置? 此操作不可逆!' onConfirm={onRestoreSettings}>
            <Button danger type='primary'>
              <IconTablerRestore />
              从专栏草稿箱中恢复
            </Button>
          </Popconfirm>
        </div>
      </SettingsGroup>

      <SettingsGroup
        title={
          <>
            其他
            <HelpInfo>这里是一些作者不愿意解释的设置项 😬</HelpInfo>
            <Button
              onClick={() => setInternalKeysExpanded((v) => !v)}
              className='ml-10px inline-icon-only-round-button'
              css={internalKeysExpanded && buttonOpenCss}
            >
              <IconParkOutlineDownC
                className={clsx(
                  'size-16px transition-300 transition-transform',
                  internalKeysExpanded ? 'rotate-180' : 'rotate-0',
                )}
              />
            </Button>
          </>
        }
      >
        <CollapsePanel expanded={internalKeysExpanded}>
          <div className='w-full flex gap-x-20px b-1px b-gate-border rounded-6px b-solid p-10px'>
            <ResetPartialSettingsButton paths={internalBooleanPaths} className='flex-none' />
            <div className='flex flex-1 flex-wrap items-start gap-x-20px gap-y-10px'>
              {internalBooleanPaths.map((k) => (
                <CheckboxSettingItem
                  key={k}
                  configPath={k as BooleanSettingsPath}
                  tooltip={
                    <>
                      {k}
                      {INTERNAL_BOOLEAN_TOOLTIPS[k] && (
                        <>
                          <br />
                          {INTERNAL_BOOLEAN_TOOLTIPS[k]}
                        </>
                      )}
                    </>
                  }
                  label={startCase(
                    k.startsWith('__internal') ? k.slice('__internal'.length) : k.replaceAll('__internal.', ''),
                  )}
                />
              ))}
            </div>
          </div>
        </CollapsePanel>
      </SettingsGroup>
    </div>
  )
}

const INTERNAL_BOOLEAN_TOOLTIPS: Partial<Record<BooleanSettingsPath, ReactNode>> = {}
