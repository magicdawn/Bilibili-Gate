import { HelpInfo } from '$components/_base/HelpInfo'
import { CheckboxSettingItem, SwitchSettingItem } from '$components/ModalSettings/setting-item'
import { IconForInfo } from '$modules/icon'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { InputNumber, Tag } from 'antd'
import { isNil } from 'es-toolkit'
import { EditableListSettingItem } from '../EditableListSettingItem'
import { SettingsGroup, sharedCss } from './shared'
import type { ComponentProps } from 'react'

export function TabPaneFilter() {
  const {
    enabled,
    minDuration,
    minPlayCount,
    minDanmakuCount,

    hideGotoTypeBangumi,
    hideGotoTypePicture,

    byAuthor,
    byTitle,
  } = useSettingsSnapshot().filter

  const getExemptFollowedTooltipProps = (
    label: '视频' | '图文',
  ): Partial<ComponentProps<typeof CheckboxSettingItem>> => {
    return {
      label: '「已关注」豁免',
      tooltipProps: { color: 'rgba(0, 0, 0, 0.85)' },
      tooltip: (
        <>
          「已关注」内容不考虑过滤条件, 总是展示
          <br />
          "豁免" 一词来源{' '}
          <a target='_blank' href='https://github.com/magicdawn/bilibili-gate/issues/1#issuecomment-2197868587'>
            pilipala
          </a>
        </>
      ),
    }
  }

  return (
    <div css={sharedCss.tabPane} className='pr-15px'>
      <SettingsGroup
        title={
          <>
            内容过滤
            <HelpInfo>
              启用过滤会大幅降低加载速度, 谨慎开启! <br />
              视频/图文/影视: 仅推荐类 Tab 生效 <br />
              UP/标题: 推荐类 / 热门 等Tab 生效
            </HelpInfo>
            <SwitchSettingItem configPath='filter.enabled' className='ml-10px' />
          </>
        }
      >
        <div className='grid grid-cols-2 gap-x-15px'>
          <div className='col'>
            <div css={sharedCss.settingsGroupSubTitle}>视频</div>
            <div className='flex flex-col gap-y-5px'>
              <div className='flex items-center'>
                <CheckboxSettingItem
                  configPath='filter.minDuration.enabled'
                  label='按视频时长过滤'
                  tooltip={<>不显示短视频</>}
                  disabled={!enabled}
                  className='min-w-130px'
                />
                <InputNumber
                  className='w-130px'
                  size='small'
                  min={1}
                  step={10}
                  addonAfter={'秒'}
                  value={minDuration.value}
                  onChange={(val) => !isNil(val) && (settings.filter.minDuration.value = val)}
                  disabled={!enabled || !minDuration.enabled}
                />
              </div>

              <div className='flex items-center'>
                <CheckboxSettingItem
                  disabled={!enabled}
                  configPath='filter.minPlayCount.enabled'
                  label='按播放次数过滤'
                  tooltip={<>不显示播放次数很少的视频</>}
                  className='min-w-130px'
                />
                <InputNumber
                  className='w-130px'
                  size='small'
                  min={1}
                  step={1000}
                  value={minPlayCount.value}
                  onChange={(val) => !isNil(val) && (settings.filter.minPlayCount.value = val)}
                  disabled={!enabled || !minPlayCount.enabled}
                  addonAfter={'次'}
                />
              </div>

              <div className='flex items-center'>
                <CheckboxSettingItem
                  disabled={!enabled}
                  configPath='filter.minDanmakuCount.enabled'
                  label='按弹幕条数过滤'
                  tooltip={<>不显示弹幕条数很少的视频</>}
                  className='min-w-130px'
                />
                <InputNumber
                  className='w-130px'
                  size='small'
                  min={1}
                  step={100}
                  value={minDanmakuCount.value}
                  onChange={(val) => !isNil(val) && (settings.filter.minDanmakuCount.value = val)}
                  disabled={!enabled || !minDanmakuCount.enabled}
                  addonAfter={'条'}
                />
              </div>
              <CheckboxSettingItem
                configPath='filter.exemptForFollowed.video'
                disabled={!enabled}
                {...getExemptFollowedTooltipProps('视频')}
              />
            </div>
          </div>

          <div className='col'>
            <div css={sharedCss.settingsGroupSubTitle}>图文</div>
            <CheckboxSettingItem
              configPath='filter.hideGotoTypePicture'
              label='过滤图文类型推荐'
              disabled={!enabled}
              className='flex'
              tooltip={
                <>
                  过滤 <kbd>goto = picture</kbd> 的内容: 包括 (动态 & 专栏) 等
                </>
              }
            />
            <CheckboxSettingItem
              className='flex'
              disabled={!enabled || !hideGotoTypePicture}
              configPath='filter.exemptForFollowed.picture'
              {...getExemptFollowedTooltipProps('图文')}
            />

            <div css={sharedCss.settingsGroupSubTitle}>影视</div>
            <CheckboxSettingItem
              configPath='filter.hideGotoTypeBangumi'
              label='过滤影视类型推荐'
              tooltip={
                <>
                  过滤 <kbd>goto = bangumi</kbd> 的内容: 包括 (番剧 / 电影 / 国创 / 纪录片) 等
                </>
              }
              disabled={!enabled}
            />
          </div>

          <div className='col'>
            <div css={sharedCss.settingsGroupSubTitle}>
              UP
              <HelpInfo>
                根据 UP 过滤视频 <br />
                使用 mid 屏蔽时支持备注, 格式: <Tag color='success'>mid(备注)</Tag>
                {'  '}如 <Tag color='success'>8047632(B站官方)</Tag> <br />
                作用范围: 推荐 / 热门 <br />
                <div className='mt-4px flex items-start'>
                  <IconForInfo className='mt-3px' />
                  <div className='ml-8px flex-1'>
                    B站官方支持黑名单, 对于不喜欢的 UP 可以直接拉黑 <br />
                    黑名单无视此页开关, 总是会过滤掉 <br />
                    这里是客户端过滤, 与黑名单功能重复, 优先使用黑名单功能 <br />
                  </div>
                </div>
              </HelpInfo>
              <SwitchSettingItem configPath='filter.byAuthor.enabled' disabled={!enabled} className='ml-10px' />
            </div>
            <EditableListSettingItem
              configPath={'filter.byAuthor.keywords'}
              searchProps={{ placeholder: '添加UP: 全名 / mid / mid(备注)' }}
              disabled={!enabled || !byAuthor.enabled}
            />
          </div>

          <div className='col'>
            <div css={sharedCss.settingsGroupSubTitle}>
              <span>标题</span>
              <HelpInfo>
                根据标题关键词过滤视频 <br />
                支持正则(i), 语法：/abc|\d+/ <br />
                作用范围: 推荐 / 热门
              </HelpInfo>
              <SwitchSettingItem configPath='filter.byTitle.enabled' disabled={!enabled} className='ml-10px' />
            </div>
            <EditableListSettingItem
              configPath={'filter.byTitle.keywords'}
              searchProps={{ placeholder: '添加过滤关键词' }}
              disabled={!enabled || !byTitle.enabled}
            />
          </div>
        </div>
      </SettingsGroup>
    </div>
  )
}
