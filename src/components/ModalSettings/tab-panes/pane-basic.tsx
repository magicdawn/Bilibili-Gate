import { Button, Divider, Select, Space, Tag } from 'antd'
import { APP_NAME } from '$common'
import { HelpInfo } from '$components/_base/HelpInfo'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { TabIcon } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoLinkOpenMode, VideoLinkOpenModeConfig } from '$components/VideoCard/index.shared'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForCopy } from '$modules/icon'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { explainForFlag, toastAndReload } from '../index.shared'
import { ResetPartialSettingsButton, SettingsGroup, sharedClassNames } from './shared'

export function TabPaneBasic() {
  const {
    videoLinkOpenMode,
    videoCard: {
      actions: { showLargePreview, openInPipWindow },
    },
  } = useSettingsSnapshot()

  const openModeOptions = useMemo(() => {
    return Object.values(VideoLinkOpenMode)
      .filter((mode) => VideoLinkOpenModeConfig[mode].enabled ?? true)
      .map((mode) => {
        const config = VideoLinkOpenModeConfig[mode]
        return {
          config,
          value: mode,
          label: (
            <span className='flex-v-center gap-x-8px'>
              {config.icon}
              <span>{config.label}</span>
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
    <div className={sharedClassNames.tabPane}>
      <SettingsGroup
        title={
          <>
            <TabIcon tabKey={ETab.AppRecommend} className='mr-5px mt-2px size-30px' />
            推荐 access_key
            <HelpInfo className='ml-5px mt-6px size-18px' IconComponent={IconParkOutlineHelp}>
              <span className='inline-flex items-center'>
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
                'multiSelect.showIcon',
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
                antMessage.success('已开启自动「查看更多」: 下次打开首页时将自动打开「查看更多」弹窗')
              }
            }}
          />

          <CheckboxSettingItem
            configPath={'showModalFeedEntry'}
            label='「查看更多」按钮'
            tooltip='是否显示「查看更多」按钮'
          />

          <CheckboxSettingItem
            configPath={'multiSelect.showIcon'}
            label='「多选」按钮'
            tooltip='是否显示「多选」按钮'
          />
        </Space>
      </SettingsGroup>

      <SettingsGroup
        titleClassName='justify-between'
        title={
          <>
            视频链接
            <ResetPartialSettingsButton paths={['videoLinkOpenMode']} />
          </>
        }
      >
        <Space size={20}>
          <div className='flex-v-center'>
            默认打开模式
            <HelpInfo useBlackBg>
              选择点击视频(封面图片 或 标题)时打开的模式 <br />
              {openModeOptions.map(({ value, config }) => {
                return (
                  !!config.desc && (
                    <div key={value} className='mt-10px flex items-start first:mt-0'>
                      <span className='inline-flex items-center'>
                        {config.icon}
                        <span className='ml-4px mr-10px min-w-95px'>{config.label}</span>
                      </span>
                      <span className='desc'>{config.desc}</span>
                    </div>
                  )
                )
              })}
            </HelpInfo>
            <Select
              className='ml-8px w-160px'
              options={openModeOptions}
              value={videoLinkOpenMode}
              onChange={(v) => {
                updateSettings({ videoLinkOpenMode: v })
              }}
            />
          </div>
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
              paths={[
                'videoCard.actions.showLargePreview',
                'videoCard.actions.openInPipWindow',
                'videoCard.videoPreview.useMp4',
                'videoCard.videoPreview.usePreferredCdn',
                'videoCard.videoPreview.useScale',
                'videoCard.videoPreview.useVideoCardAsTrigger',
                'pipWindow.defaultLocked',
                'pipWindow.autoWebFullscreen',
              ]}
            />
          </>
        }
      >
        <div className='grid grid-cols-[repeat(2,max-content)_1fr] items-start gap-x-20px'>
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
                <ul className='ml-30px list-circle'>
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
          <Divider className='grid-col-span-full my-2px py-0' />
          <div className='flex flex-col'>
            <CheckboxSettingItem
              configPath='videoCard.videoPreview.useMp4'
              disabled={!showLargePreview}
              label='浮动预览: 使用 mp4'
              tooltip={explainForFlag('使用 mp4, 最高 720p, 有声音', '使用 dash, 最高 1080p, 无声音, 理论上更快')}
            />
            <CheckboxSettingItem
              configPath='videoCard.videoPreview.usePreferredCdn'
              disabled={!showLargePreview}
              label='浮动预览: 使用优选 CDN'
              tooltip={explainForFlag('使用优选 CDN (降低 MCDN & PCDN 优先级)', '使用默认 CDN')}
            />
            <CheckboxSettingItem
              configPath='videoCard.videoPreview.useScale'
              disabled={!showLargePreview}
              label='浮动预览: 使用放大效果'
              tooltip={explainForFlag('浮动预览面板: 放大展开 (类似浮图秀)', '浮动预览面板: 滑动展开')}
            />
            <CheckboxSettingItem
              configPath='videoCard.videoPreview.useVideoCardAsTrigger'
              disabled={!showLargePreview}
              label='浮动预览: 使用视频卡片作为触发器'
              tooltip={
                <>
                  使用视频卡片作为触发器 <br />
                  <ul className='list-circle pl-25px'>
                    <li>悬浮视频卡片 1 秒后展开「浮动预览」</li>
                    <li>与视频卡片右上角按钮相比, 更容易触发, 但也容易非预览意图误触发</li>
                    <li>与视频卡片右上角按钮独立, 关掉视频卡片按钮, 此选项仍然生效</li>
                  </ul>
                </>
              }
            />
          </div>
          <div className='flex flex-col'>
            <CheckboxSettingItem
              configPath='pipWindow.defaultLocked'
              disabled={!openInPipWindow}
              label='小窗: 默认锁定'
              tooltip={explainForFlag('小窗打开时: 默认锁定', '小窗打开时: 不锁定')}
            />
            <CheckboxSettingItem
              configPath='pipWindow.autoWebFullscreen'
              disabled={!openInPipWindow}
              label='小窗: 自动网页全屏'
              tooltip={explainForFlag('自动网页全屏', '不启用')}
            />
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup
        titleClassName='justify-between'
        title={
          <>
            预览
            <ResetPartialSettingsButton paths={['autoPreviewWhenKeyboardSelect', 'autoPreviewWhenHover']} />
          </>
        }
        contentClassName='flex-row flex-wrap items-center gap-x-10px'
      >
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
      </SettingsGroup>

      <SettingsGroup
        title={
          <>
            帮助
            <span className='relative top-4px ml-8px mr-4px inline-flex items-center text-size-14px'>
              当前版本
              <Tag color='green' className='mx-4px cursor-pointer' onClick={handleCopyScriptVersion}>
                {APP_NAME} v{__SCRIPT_VERSION__}
              </Tag>
              <IconForCopy className='size-16px cursor-pointer' onClick={handleCopyScriptVersion} />
            </span>
          </>
        }
        contentClassName='flex-row gap-x-10px'
      >
        <AntdTooltip title='来个 Star 支持一下'>
          <Button href='https://github.com/magicdawn/Bilibili-Gate' target='_blank'>
            GitHub 主页
          </Button>
        </AntdTooltip>
        <Button href='https://afdian.com/a/magicdawn' target='_blank'>
          「爱发电」支持
        </Button>

        <Button href='https://greasyfork.org/zh-CN/scripts/443530-bilibili-gate' target='_blank'>
          GreasyFork 主页
        </Button>

        <Button
          href='https://github.com/magicdawn/Bilibili-Gate/#%E5%BF%AB%E6%8D%B7%E9%94%AE%E8%AF%B4%E6%98%8E'
          target='_blank'
        >
          查看可用的快捷键
        </Button>
        <Button href='https://github.com/magicdawn/Bilibili-Gate/releases' target='_blank'>
          更新日志
        </Button>
      </SettingsGroup>
    </div>
  )
}
