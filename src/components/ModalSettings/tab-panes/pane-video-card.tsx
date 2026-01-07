import { useKeyPress } from 'ahooks'
import { Divider, Select, Slider, Tag } from 'antd'
import { isEqual, pick } from 'es-toolkit'
import { useMemo } from 'react'
import { HelpInfo } from '$components/_base/HelpInfo'
import { EVideoLinkOpenMode, VideoLinkOpenModeConfig } from '$components/VideoCard/index.shared'
import { antMessage } from '$modules/antd'
import { settings, updateSettings, useSettingsSnapshot, type Settings } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { explainForFlag } from '../index.shared'
import { CheckboxSettingItem, SwitchSettingItem } from '../setting-item'
import { SettingsGroup, sharedClassNames } from './shared'

type CardBorderState = Partial<Pick<Settings['style']['videoCard'], 'useBorder' | 'useBorderOnlyOnHover'>>
const borderCycleList: CardBorderState[] = [
  { useBorder: false }, // no border
  { useBorder: true, useBorderOnlyOnHover: true }, // on hover
  { useBorder: true, useBorderOnlyOnHover: false }, // always
]
const borderCycleListLabels = ['「卡片边框」: 禁用', '「卡片边框」: 仅在悬浮时显示', '「卡片边框」: 总是显示']
export function useHotkeyForConfigBorder() {
  return useKeyPress(
    ['shift.b'],
    (e) => {
      if (shouldDisableShortcut()) return

      const curState: CardBorderState = pick(settings.style.videoCard, ['useBorder', 'useBorderOnlyOnHover'])
      const curIndex = borderCycleList.findIndex((state) => {
        return isEqual(state, pick(curState, Object.keys(state) as (keyof CardBorderState)[]))
      })
      if (curIndex === -1) throw new Error('unexpected curIndex = -1')

      const nextIndex = (curIndex + 1) % borderCycleList.length
      const nextState = borderCycleList[nextIndex]
      Object.assign(settings.style.videoCard, nextState)

      const nextLabel = borderCycleListLabels[nextIndex]
      antMessage.success(nextLabel)
    },
    { exactMatch: true },
  )
}

export function TabPaneVideoCard() {
  const {
    videoCard: {
      actions: { showLargePreview, openInPipWindow },
      imgPreview: { enabled: imgPreviewEnabled },
    },
    videoLinkOpenMode,
    style,
    autoPreviewUpdateInterval,
  } = useSettingsSnapshot()

  const openModeOptions = useMemo(() => {
    return Object.values(EVideoLinkOpenMode)
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

  return (
    <div className={sharedClassNames.tabPane}>
      {/* 视频链接 */}
      <SettingsGroup title='视频链接' resetSettingPaths={['videoLinkOpenMode']}>
        <div className='flex-v-center'>
          打开方式
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
      </SettingsGroup>

      {/* 边框样式 */}
      <SettingsGroup
        title='边框样式'
        resetSettingPaths={[
          'style.videoCard.useBorder',
          'style.videoCard.useBorderOnlyOnHover',
          'style.videoCard.useBoxShadow',
        ]}
      >
        <div className={sharedClassNames.settingsLine}>
          <CheckboxSettingItem
            configPath='style.videoCard.useBorder'
            label='使用卡片边框'
            tooltip={
              <>
                勾选后, 视频卡片会有边框包裹, 更像是一个卡片~ <br />
                整个卡片区域可点击 / 可触发预览 / 可使用右键菜单 <br />
                否则只是封面区域可以 <br />
                使用快捷键 <Tag color='green'>shift+b</Tag> 切换状态 <br />
                {borderCycleListLabels.map((label) => (
                  <Tag color='success' key={label} className='mx-1'>
                    {label}
                  </Tag>
                ))}
              </>
            }
          />

          <CheckboxSettingItem
            configPath='style.videoCard.useBorderOnlyOnHover'
            label='仅在悬浮时显示'
            disabled={!style.videoCard.useBorder}
            tooltip={explainForFlag('仅在悬浮时显示', '常驻显示')}
          />

          <CheckboxSettingItem
            configPath='style.videoCard.useBoxShadow'
            disabled={!style.videoCard.useBorder}
            label='悬浮卡片时使用发光效果'
            tooltip={<>悬浮卡片时使用发光效果, 看起来比较花哨~</>}
          />
        </div>
      </SettingsGroup>

      {/* 快照预览 */}
      <SettingsGroup
        title={
          <>
            快照预览
            <SwitchSettingItem configPath='videoCard.imgPreview.enabled' tooltip='关闭此功能' className='ml-3' />
          </>
        }
        resetSettingPaths={[
          'videoCard.imgPreview.enabled',
          'videoCard.imgPreview.autoPreviewWhenKeyboardSelect',
          'videoCard.imgPreview.autoPreviewWhenHover',
          'videoCard.imgPreview.disableWhenMultiSelecting',
          'useDelayForHover',
          'autoPreviewUpdateInterval',
        ]}
      >
        <div className={sharedClassNames.settingsLine}>
          <CheckboxSettingItem
            disabled={!imgPreviewEnabled}
            configPath='videoCard.imgPreview.autoPreviewWhenHover'
            label='鼠标悬浮后自动开始'
            tooltip={
              <>
                {explainForFlag('鼠标悬浮后自动开始预览, 不跟随鼠标位置', '预览进度跟随鼠标位置(百分比)')}
                切换设置快捷键: <Tag color='green'>shift+m</Tag>
              </>
            }
          />
          <CheckboxSettingItem
            disabled={!imgPreviewEnabled}
            configPath='videoCard.imgPreview.disableWhenMultiSelecting'
            label='多选时禁用'
            tooltip={explainForFlag('多选开启时, 禁用快照预览', '不禁用')}
          />
          <CheckboxSettingItem
            disabled={!imgPreviewEnabled}
            configPath='useDelayForHover'
            label='延迟悬浮预览'
            tooltip={'延迟悬浮预览'}
          />
          <CheckboxSettingItem
            disabled={!imgPreviewEnabled}
            configPath='videoCard.imgPreview.autoPreviewWhenKeyboardSelect'
            label='键盘选中后自动开始'
            tooltip={
              <>
                手动预览快捷键: <Tag color='green'>.</Tag> or <Tag color='green'>p</Tag> <br />
                切换设置快捷键: <Tag color='green'>shift+p</Tag>
              </>
            }
          />
        </div>
        <div className={sharedClassNames.settingsLine}>
          自动预览更新间隔
          <Slider
            disabled={!imgPreviewEnabled}
            className='w-500px'
            min={0}
            max={1000}
            keyboard
            onChange={(val) => (settings.autoPreviewUpdateInterval = val)}
            value={autoPreviewUpdateInterval}
          />
          <span style={{ width: '65px' }}>({autoPreviewUpdateInterval}ms)</span>
        </div>
      </SettingsGroup>

      {/* 操作按钮 */}
      <SettingsGroup
        title={
          <>
            操作按钮
            <HelpInfo>
              视频卡片右上角「稍后再看」按钮旁 <br />
              「稍后再看」因其通用性不提供关闭选项
            </HelpInfo>
          </>
        }
        resetSettingPaths={[
          'videoCard.actions.showLargePreview',
          'videoCard.actions.openInPipWindow',
          'videoCard.videoPreview.useMp4',
          'videoCard.videoPreview.usePreferredCdn',
          'videoCard.videoPreview.useScale',
          'videoCard.videoPreview.useVideoCardAsTrigger',
          'pipWindow.defaultLocked',
          'pipWindow.autoWebFullscreen',
        ]}
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
              label='浮动预览: 使用视频卡片作为触发器'
              tooltip={
                <>
                  {explainForFlag(
                    '使用「视频卡片」作为触发器',
                    '使用「视频卡片右上角按钮」作为触发器, 悬浮视频卡片 1 秒后展开',
                  )}
                  <Divider className='my-1' />
                  <ul className='ml-25px list-circle'>
                    <li>与上面「浮动预览」开关独立</li>
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
    </div>
  )
}
