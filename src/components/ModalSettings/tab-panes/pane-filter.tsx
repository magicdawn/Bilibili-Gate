import { Button, InputNumber, Popover, Space, Tabs, Tag } from 'antd'
import clsx from 'clsx'
import { isEqual, isNil } from 'es-toolkit'
import pmap from 'promise.map'
import { HelpInfo, TOOLTIP_BLACK_BG_COLOR } from '$components/_base/HelpInfo'
import { CheckboxSettingItem, SwitchSettingItem } from '$components/ModalSettings/setting-item'
import { TabIcon } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { antMessage } from '$modules/antd'
import { getUserNickname } from '$modules/bilibili/user/nickname'
import {
  exportDfFilterByTitle,
  exportDfHideOpusMids,
  exportFilterByAuthor,
  exportFilterByTitle,
  importDfFilterByTitle,
  importDfHideOpusMids,
  importFilterByAuthor,
  importFilterByTitle,
} from '$modules/filter/import-export'
import { parseUpRepresent } from '$modules/filter/parse'
import { IconForDelete, IconForInfo } from '$modules/icon'
import { IconForPopoverTrigger } from '$modules/rec-services/dynamic-feed/shared'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { EditableListSettingItem } from '../EditableListSettingItem'
import { SettingsGroup, sharedClassNames } from './shared'
import type { ComponentProps } from 'react'

const C = {
  blockContainer: 'b-1px b-gate-border rounded-lg b-solid p-x-2 p-y-1 light:hover:b-gate-primary',
}

export function TabPaneFilter() {
  return (
    <div className={clsx(sharedClassNames.tabPane, 'pr-15px')}>
      <SettingsGroup
        title={
          <>
            内容过滤
            <SwitchSettingItem configPath='filter.enabled' className='ml-10px' />
          </>
        }
      >
        <Tabs
          items={[
            {
              key: 'recommend',
              label: (
                <span className='inline-flex-center gap-x-1'>
                  <TabIcon tabKey={ETab.AppRecommend} />
                  推荐 / 热门
                  <HelpInfo className='ml-1'>
                    生效范围: <br />
                    视频/图文/影视: 推荐类 Tab <br />
                    UP/标题: 推荐类、热门 Tab <br />
                  </HelpInfo>
                </span>
              ),
              children: <SubTabFilterForRec />,
            },
            {
              key: 'dynamic-feed',
              label: (
                <span className='inline-flex-center gap-x-1'>
                  <TabIcon tabKey={ETab.DynamicFeed} />
                  动态
                  <HelpInfo className='ml-1'>
                    使用场景: 关注的 UP 发布的部分内容 <br />
                    <ol>
                      <li>如果有规律可以按标题关键字过滤</li>
                      <li>没有规律可以屏蔽 UP 发布的全部图文动态</li>
                    </ol>
                  </HelpInfo>
                </span>
              ),
              children: <SubTabFilterForDynamicFeed />,
            },
          ]}
        />
      </SettingsGroup>
    </div>
  )
}

function SubTabFilterForRec() {
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
      tooltipProps: { color: TOOLTIP_BLACK_BG_COLOR },
      tooltip: (
        <>
          「已关注」内容不考虑过滤条件, 总是展示
          <br />
          "豁免" 一词来源{' '}
          <a target='_blank' href='https://github.com/magicdawn/Bilibili-Gate/issues/1#issuecomment-2197868587'>
            pilipala
          </a>
        </>
      ),
    }
  }

  return (
    <>
      <div className='grid grid-cols-2 gap-15px'>
        <div>
          <div className={sharedClassNames.settingsGroupSubTitle}>视频</div>
          <div className='flex flex-col gap-y-1'>
            <div className='flex items-center'>
              <CheckboxSettingItem
                configPath='filter.minDuration.enabled'
                label='按视频时长过滤'
                tooltip={<>不显示短视频</>}
                disabled={!enabled}
                className='min-w-130px'
              />
              <Space.Compact>
                <InputNumber
                  className='w-130px'
                  size='small'
                  min={1}
                  step={10}
                  value={minDuration.value}
                  onChange={(val) => !isNil(val) && (settings.filter.minDuration.value = val)}
                  disabled={!enabled || !minDuration.enabled}
                />
                <Space.Addon>秒</Space.Addon>
              </Space.Compact>
            </div>

            <div className='flex items-center'>
              <CheckboxSettingItem
                disabled={!enabled}
                configPath='filter.minPlayCount.enabled'
                label='按播放次数过滤'
                tooltip={<>不显示播放次数很少的视频</>}
                className='min-w-130px'
              />
              <Space.Compact>
                <InputNumber
                  className='w-130px'
                  size='small'
                  min={1}
                  step={1000}
                  value={minPlayCount.value}
                  onChange={(val) => !isNil(val) && (settings.filter.minPlayCount.value = val)}
                  disabled={!enabled || !minPlayCount.enabled}
                />
                <Space.Addon>次</Space.Addon>
              </Space.Compact>
            </div>

            <div className='flex items-center'>
              <CheckboxSettingItem
                disabled={!enabled}
                configPath='filter.minDanmakuCount.enabled'
                label='按弹幕条数过滤'
                tooltip={<>不显示弹幕条数很少的视频</>}
                className='min-w-130px'
              />
              <Space.Compact>
                <InputNumber
                  className='w-130px'
                  size='small'
                  min={1}
                  step={100}
                  value={minDanmakuCount.value}
                  onChange={(val) => !isNil(val) && (settings.filter.minDanmakuCount.value = val)}
                  disabled={!enabled || !minDanmakuCount.enabled}
                />
                <Space.Addon>条</Space.Addon>
              </Space.Compact>
            </div>
            <CheckboxSettingItem
              configPath='filter.exemptForFollowed.video'
              disabled={!enabled}
              {...getExemptFollowedTooltipProps('视频')}
            />
          </div>
        </div>

        <div>
          <div className={sharedClassNames.settingsGroupSubTitle}>图文</div>
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

          <div className={clsx(sharedClassNames.settingsGroupSubTitle, 'mt-2')}>影视</div>
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

        <div className={clsx(C.blockContainer, 'col-span-full')}>
          <div className={sharedClassNames.settingsGroupSubTitle}>
            UP
            <HelpInfo>
              根据 UP 过滤视频 <br />
              使用 mid 屏蔽时支持备注, 格式: <Tag color='success'>mid(备注)</Tag> 如{' '}
              <Tag color='success'>8047632(B站官方)</Tag>
              <br />
              <div className='mt-4px flex items-start'>
                <IconForInfo className='mt-3px' />
                <div className='ml-8px flex-1'>
                  B站官方支持黑名单, 对于不喜欢的 UP 可以直接拉黑 <br />
                  此脚本会拉取官方黑名单, 并无视此页开关, 总是会过滤掉 <br />
                  这里是客户端过滤, 与黑名单功能重复, 优先使用黑名单功能 <br />
                </div>
              </div>
            </HelpInfo>
            <SwitchSettingItem configPath='filter.byAuthor.enabled' disabled={!enabled} className='ml-10px' />
            <div className='flex-1' />
            <Popover
              placement='left'
              content={
                <div className='flex flex-col gap-x-10px gap-y-5px'>
                  <Button onClick={clear_filterByAuthor_uselessRemarkData}>
                    <IconForDelete />
                    清理无效备注数据
                  </Button>
                  <Button onClick={exportFilterByAuthor} disabled={!byAuthor.keywords.length}>
                    <IconTablerFileExport />
                    导出
                  </Button>
                  <Button onClick={importFilterByAuthor}>
                    <IconTablerFileImport />
                    导入
                  </Button>
                </div>
              }
            >
              <Button className='icon-only-round-button size-26px'>
                <IconForPopoverTrigger className='size-16px' />
              </Button>
            </Popover>
          </div>
          <EditableListSettingItem
            configPath={'filter.byAuthor.keywords'}
            searchProps={{ placeholder: '添加UP: 全名 / mid / mid(备注)' }}
            disabled={!enabled || !byAuthor.enabled}
            className='mt-2'
            listClassName='max-h-130px'
          />
        </div>

        <div className={clsx(C.blockContainer, 'col-span-full')}>
          <div className={clsx(sharedClassNames.settingsGroupSubTitle)}>
            <span>标题</span>
            <HelpInfo>
              根据标题关键词过滤视频 <br />
              支持普通关键字和正则(i), 语法：
              <Tag color='success' variant='solid'>
                /abc|\d+/
              </Tag>
            </HelpInfo>
            <SwitchSettingItem configPath='filter.byTitle.enabled' disabled={!enabled} className='ml-10px' />
            <div className='flex-1' />
            <Popover
              placement='left'
              content={
                <div className='flex flex-col gap-x-10px gap-y-5px'>
                  <Button onClick={exportFilterByTitle} disabled={!byTitle.keywords.length}>
                    <IconTablerFileExport />
                    导出
                  </Button>
                  <Button onClick={importFilterByTitle}>
                    <IconTablerFileImport />
                    导入
                  </Button>
                </div>
              }
            >
              <Button className='icon-only-round-button size-26px'>
                <IconForPopoverTrigger className='size-16px' />
              </Button>
            </Popover>
          </div>
          <EditableListSettingItem
            configPath={'filter.byTitle.keywords'}
            searchProps={{ placeholder: '添加过滤关键词' }}
            disabled={!enabled || !byTitle.enabled}
            listClassName='max-h-130px'
          />
        </div>
      </div>
    </>
  )
}

function SubTabFilterForDynamicFeed() {
  const {
    filter: { enabled, dfByTitle, dfHideOpusMids },
  } = useSettingsSnapshot()
  return (
    <div className='flex flex-col gap-y-15px'>
      <div className={C.blockContainer}>
        <div className={sharedClassNames.settingsGroupSubTitle}>
          <span>标题</span>
          <HelpInfo>
            支持普通关键字和正则(i), 语法：
            <Tag color='success' variant='solid'>
              /abc|\d+/
            </Tag>
            <br />
            作用范围: 支持的动态类型: 视频 / 图文
          </HelpInfo>
          <SwitchSettingItem configPath='filter.dfByTitle.enabled' disabled={!enabled} className='ml-10px' />
          <div className='flex-1' />
          <Popover
            placement='left'
            content={
              <div className='flex flex-col gap-x-10px gap-y-5px'>
                <Button onClick={exportDfFilterByTitle} disabled={!dfByTitle.keywords.length}>
                  <IconTablerFileExport />
                  导出
                </Button>
                <Button onClick={importDfFilterByTitle}>
                  <IconTablerFileImport />
                  导入
                </Button>
              </div>
            }
          >
            <Button className='icon-only-round-button size-26px'>
              <IconForPopoverTrigger className='size-16px' />
            </Button>
          </Popover>
        </div>
        <EditableListSettingItem
          configPath={'filter.dfByTitle.keywords'}
          searchProps={{ placeholder: '添加过滤关键词' }}
          disabled={!enabled || !dfByTitle.enabled}
        />
      </div>

      <div className={C.blockContainer}>
        <div className={sharedClassNames.settingsGroupSubTitle}>
          <span>屏蔽 UP 的图文动态</span>
          <HelpInfo>
            支持 mid 或 mid(备注) <br />
            右键图文动态可快速添加
          </HelpInfo>
          <SwitchSettingItem configPath='filter.dfHideOpusMids.enabled' disabled={!enabled} className='ml-10px' />
          <div className='flex-1' />
          <Popover
            placement='left'
            content={
              <div className='flex flex-col gap-x-10px gap-y-5px'>
                <Button onClick={exportDfHideOpusMids} disabled={!dfHideOpusMids.keywords.length}>
                  <IconTablerFileExport />
                  导出
                </Button>
                <Button onClick={importDfHideOpusMids}>
                  <IconTablerFileImport />
                  导入
                </Button>
              </div>
            }
          >
            <Button className='icon-only-round-button size-26px'>
              <IconForPopoverTrigger className='size-16px' />
            </Button>
          </Popover>
        </div>
        <EditableListSettingItem
          configPath={'filter.dfHideOpusMids.keywords'}
          searchProps={{ placeholder: '添加 UP: mid / mid(备注)' }}
          disabled={!enabled || !dfHideOpusMids.enabled}
          listClassName='max-h-130px'
        />
      </div>
    </div>
  )
}

async function clear_filterByAuthor_uselessRemarkData() {
  const list = settings.filter.byAuthor.keywords
  const newList = await pmap(
    list,
    async (item) => {
      const { mid, remark } = parseUpRepresent(item)
      if (!mid || !remark) return item

      const nickname = await getUserNickname(mid)
      if (nickname !== remark) return item

      // cleanup remark, keep mid only
      return mid
    },
    Infinity, // concurrency does not matter, since internal `__fetchSpaceAccInfo` has concurrency limit
  )

  if (isEqual(newList, list)) {
    return antMessage.warning('没有「无效备注」数据!')
  }

  settings.filter.byAuthor.keywords = newList
  return antMessage.success('已清理「无效备注」数据!')
}
