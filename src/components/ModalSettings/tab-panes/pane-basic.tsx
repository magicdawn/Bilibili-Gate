import { APP_NAME } from '$common'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { TabIcon } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoLinkOpenMode, VideoLinkOpenModeConfig } from '$components/VideoCard/index.shared'
import { HelpInfo } from '$components/_base/HelpInfo'
import { antMessage } from '$modules/antd'
import { IconForCopy } from '$modules/icon'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { css } from '@emotion/react'
import { Button, Select, Space, Tag } from 'antd'
import { explainForFlag, toastAndReload } from '../index.shared'
import { ResetPartialSettingsButton, SettingsGroup, sharedCss } from './shared'

export function TabPaneBasic() {
  const { videoLinkOpenMode } = useSettingsSnapshot()

  const openModeOptions = useMemo(() => {
    return Object.values(VideoLinkOpenMode)
      .filter((mode) => VideoLinkOpenModeConfig[mode].enabled ?? true)
      .map((mode) => {
        const config = VideoLinkOpenModeConfig[mode]
        return {
          config,
          value: mode,
          label: (
            <span
              className='flex items-center'
              css={css`
                .label {
                  margin-left: 8px;
                }
              `}
            >
              {config.icon}
              <span className='label'>{config.label}</span>
            </span>
          ),
        }
      })
  }, [])

  const handleCopyScriptVersion = useMemoizedFn(() => {
    const content = `v${__SCRIPT_VERSION__}`
    GM.setClipboard(content)
    antMessage.success(`已复制当前版本: ${content}`)
  })

  return (
    <div css={sharedCss.tabPane}>
      <SettingsGroup
        title={
          <>
            <TabIcon tabKey={ETab.AppRecommend} className='size-30px mr-5px mt-2px' />
            推荐 access_key
            <HelpInfo className='size-18px ml-5px mt-6px' IconComponent={IconParkOutlineHelp}>
              <span className='inline-flex-v-center'>
                用于「
                <TabIcon tabKey={ETab.AppRecommend} className='mr-5px' />
                推荐」Tab
              </span>
              <br />
              用于 获取推荐 / 提交不喜欢等操作
            </HelpInfo>
          </>
        }
      >
        <AccessKeyManage />
      </SettingsGroup>

      <SettingsGroup
        titleClassName='justify-between'
        title={
          <>
            开关
            <ResetPartialSettingsButton
              paths={[
                'pureRecommend',
                'useNarrowMode',
                'showModalFeedOnLoad',
                'showModalFeedEntry',
              ]}
            />
          </>
        }
      >
        <Space size={10} wrap>
          <CheckboxSettingItem
            configPath='pureRecommend'
            label='全屏模式'
            tooltip={
              <>
                清空自带推荐内容, 只显示脚本推荐
                <br />
                P.S 需要刷新网页~
                <br />
                P.S 之前版本称 (纯推荐模式)
              </>
            }
            extraAction={() => toastAndReload()}
          />

          <CheckboxSettingItem
            configPath={'useNarrowMode'}
            label='居中模式'
            tooltip={
              <>
                居中两列
                <br />
                切换设置快捷键: <Tag color='green'>shift+c</Tag>
              </>
            }
          />

          <CheckboxSettingItem
            configPath={'showModalFeedOnLoad'}
            label='自动「查看更多」'
            tooltip='打开首页时自动打开「查看更多」弹窗'
            extraAction={(val) => {
              if (val) {
                antMessage.success(
                  '已开启自动「查看更多」: 下次打开首页时将自动打开「查看更多」弹窗',
                )
              }
            }}
          />

          <CheckboxSettingItem
            configPath={'showModalFeedEntry'}
            label='「查看更多」按钮'
            tooltip='是否展示「查看更多」按钮'
          />
        </Space>
      </SettingsGroup>

      <SettingsGroup
        titleClassName='justify-between'
        title={
          <>
            视频链接
            <ResetPartialSettingsButton paths={['videoLinkOpenMode', 'pipWindowDefaultLocked']} />
          </>
        }
      >
        <Space size={20}>
          <div className='flex-v-center'>
            默认打开模式
            <HelpInfo
              tooltipProps={{ color: 'rgba(0, 0, 0, 0.85)' }} // 默认使用 colorPrimary, 链接可能看不清
            >
              选择点击视频(封面图片 或 标题)时打开的模式 <br />
              {openModeOptions.map(({ value, config }) => {
                return (
                  !!config.desc && (
                    <div
                      key={value}
                      css={css`
                        display: flex;
                        align-items: flex-start;
                        margin-top: 10px;
                        &:first-child {
                          margin-top: 0;
                        }
                        .label {
                          display: inline-flex;
                          align-items: center;
                          .text {
                            min-width: 95px;
                            margin-left: 4px;
                            margin-right: 10px;
                          }
                        }
                      `}
                    >
                      <span className='label'>
                        {config.icon}
                        <span className='text'>{config.label}</span>
                      </span>
                      <span className='desc'>{config.desc}</span>
                    </div>
                  )
                )
              })}
            </HelpInfo>
            <Select
              className='w-160px ml-8px'
              options={openModeOptions}
              value={videoLinkOpenMode}
              onChange={(v) => {
                updateSettings({ videoLinkOpenMode: v })
              }}
            />
          </div>

          <CheckboxSettingItem
            configPath='pipWindowDefaultLocked'
            label='小窗默认锁定'
            tooltip='开启后, 小窗打开时默认为锁定状态'
          />
        </Space>
      </SettingsGroup>

      <SettingsGroup
        titleClassName='justify-between'
        title={
          <>
            <span className='flex items-center'>
              视频卡片操作 <HelpInfo>视频卡片右上角「稍后再看」按钮旁</HelpInfo>
            </span>
            <ResetPartialSettingsButton
              paths={['videoCard.actions.showLargePreview', 'videoCard.actions.openInPipWindow']}
            />
          </>
        }
      >
        <div className='flex items-center gap-x-10px'>
          <CheckboxSettingItem
            configPath='videoCard.actions.showLargePreview'
            label={'浮动预览'}
            tooltip={
              <>
                创意来源「浮图秀」, 但使用视频预览 <br />
                操作说明: <br />
                1. 鼠标悬浮打开 「浮动预览」, 离开关闭 <br />
                2. 点击固定「浮动预览」, 固定指: 不再随鼠标移出关闭预览 <br />
                3. 可使用以下方式关闭固定的「浮动预览」
                <ul className='list-circle ml-30px'>
                  <li>再次点击视频卡片按钮</li>
                  <li>点击预览视频右上方的「关闭」按钮</li>
                  <li>触发其他卡片的「浮动预览」</li>
                  <li>Esc键</li>
                  <li>点击页面空白处</li>
                </ul>
              </>
            }
          />

          <CheckboxSettingItem
            configPath='videoCard.actions.openInPipWindow'
            label={'小窗打开'}
            tooltip={<>仅当「文档画中画」API 可用时, 勾选生效</>}
          />
        </div>
      </SettingsGroup>

      <SettingsGroup
        titleClassName='justify-between'
        title={
          <>
            预览
            <ResetPartialSettingsButton
              paths={[
                'autoPreviewWhenKeyboardSelect',
                'autoPreviewWhenHover',
                'videoCard.videoPreview.useMp4',
                'videoCard.videoPreview.useScale',
              ]}
            />
          </>
        }
      >
        <Space size={10}>
          <CheckboxSettingItem
            configPath='autoPreviewWhenKeyboardSelect'
            label='键盘选中后自动开始预览'
            tooltip={
              <>
                手动预览快捷键: <Tag color='green'>.</Tag> or <Tag color='green'>p</Tag>
                <br />
                切换设置快捷键: <Tag color='green'>shift+p</Tag>
              </>
            }
          />

          <CheckboxSettingItem
            configPath='autoPreviewWhenHover'
            label='鼠标悬浮后自动开始预览'
            tooltip={
              <>
                鼠标悬浮后自动开始预览, 预览不再跟随鼠标位置 <br />
                切换设置快捷键: <Tag color='green'>shift+m</Tag>
              </>
            }
          />

          <CheckboxSettingItem
            configPath='videoCard.videoPreview.useMp4'
            label='浮动预览使用 mp4'
            tooltip={
              <>{explainForFlag('使用 mp4, 最高 720p, 有声音', '使用 dash, 最高 1080p, 无声音')}</>
            }
          />

          <CheckboxSettingItem
            configPath='videoCard.videoPreview.useScale'
            label='浮动预览使用放大效果'
            tooltip={<>{explainForFlag('浮动预览面板 放大展开', '浮动预览面板 滑动展开')}</>}
          />
        </Space>
      </SettingsGroup>

      <SettingsGroup
        title={
          <>
            帮助
            <span
              css={css`
                margin-left: 8px;
                margin-right: 4px;
                font-size: 14px;
                position: relative;
                top: 4px;
                display: inline-flex;
                align-items: center;
              `}
            >
              当前版本
              <Tag
                color='green'
                className='cursor-pointer mx-4px'
                onClick={handleCopyScriptVersion}
              >
                {APP_NAME} v{__SCRIPT_VERSION__}
              </Tag>
              <IconForCopy className='size-16px cursor-pointer' onClick={handleCopyScriptVersion} />
            </span>
          </>
        }
      >
        <Space size={10} wrap>
          <Button href='https://github.com/magicdawn/bilibili-gate' target='_blank'>
            GitHub 主页
          </Button>
          <Button href='https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate' target='_blank'>
            GreasyFork 主页
          </Button>
          <Button
            href='https://github.com/magicdawn/bilibili-gate#%E5%BF%AB%E6%8D%B7%E9%94%AE%E8%AF%B4%E6%98%8E'
            target='_blank'
          >
            查看可用的快捷键
          </Button>
          <Button href='https://github.com/magicdawn/bilibili-gate/releases' target='_blank'>
            更新日志
          </Button>
          <Button href='https://afdian.com/a/magicdawn' target='_blank'>
            去「爱发电」支持
          </Button>
        </Space>
      </SettingsGroup>
    </div>
  )
}
