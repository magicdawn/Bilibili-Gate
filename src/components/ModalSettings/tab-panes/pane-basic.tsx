import { useHover, useMemoizedFn, useMount } from 'ahooks'
import { Button, InputNumber, Radio, Tag } from 'antd'
import clsx from 'clsx'
import { delay } from 'es-toolkit'
import { useRef } from 'react'
import { subscribeKey } from 'valtio/utils'
import { APP_NAME } from '$common'
import { TooltipContentDivider } from '$components/_base'
import { HelpInfo } from '$components/_base/HelpInfo'
import { AccessKeyManage } from '$components/AccessKeyManage'
import { CustomKbd } from '$components/fragments'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { GridDisplayModeSwitcher } from '$components/RecGrid/display-mode'
import { TabIcon } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { ESidebarAlign } from '$enums'
import { antMessage } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForCopy } from '$modules/icon'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { explainForFlag, toastAndReload } from '../index.shared'
import { SettingsGroup, sharedClassNames } from './shared'

export function TabPaneBasic() {
  const {
    grid: { useCustomGrid, enableForceColumn, forceColumnCount, cardMinWidth },
    style,
    enableSidebar,
    sidebarAlign,
  } = useSettingsSnapshot()

  useMount(() => {
    return subscribeKey(settings, 'pureRecommend', async (v) => {
      await delay(0)
      toastAndReload()
    })
  })

  const handleCopyScriptVersion = useMemoizedFn(() => {
    const content = `v${__SCRIPT_VERSION__}`
    GM.setClipboard(content)
    antMessage.success(`已复制当前版本: ${content}`)
  })

  const peekIconRef = useRef<SVGSVGElement>(null)
  const peekIconHovering = useHover(peekIconRef)

  return (
    <div className={sharedClassNames.tabPane}>
      <SettingsGroup
        title={
          <>
            <TabIcon tabKey={ETab.AppRecommend} className='mr-5px mt-2px size-30px' />
            access_key
            <HelpInfo
              className='ml-5px mt-6px size-18px'
              IconComponent={IconParkOutlineHelp}
              tooltipProps={{ classNames: { root: 'text-14px' } }}
            >
              App 端登录凭证, 使用情况: <br />
              <TooltipContentDivider />
              <div className='group flex items-start'>
                <div className='w-55px flex flex-none items-center'>
                  <TabIcon tabKey={ETab.AppRecommend} className='mr-1' /> 推荐
                </div>
                <ul className='flex-1 list-disc pl-20px'>
                  <li className='w-max'>获取推荐</li>
                  <li className='w-max'>提交不喜欢</li>
                </ul>
              </div>
              <TooltipContentDivider />
              <div className='group flex items-start'>
                <div className='w-55px flex flex-none items-center'>
                  <TabIcon tabKey={ETab.Liked} className='mr-1' />赞
                </div>
                <ul className='w-max flex-1 list-disc pl-20px'>
                  <li className='w-max'>获取点赞列表</li>
                </ul>
              </div>
            </HelpInfo>
          </>
        }
      >
        <AccessKeyManage />
      </SettingsGroup>

      <SettingsGroup
        title='开关'
        resetSettingPaths={['pureRecommend', 'multiSelect.showIcon', 'showBackForwardButtons']}
      >
        <div className={sharedClassNames.settingsLine}>
          <CheckboxSettingItem
            configPath='pureRecommend'
            label='覆盖默认推荐'
            tooltip={
              <>
                {explainForFlag(
                  '覆盖默认推荐内容',
                  `保留默认首页; 你可以从屏幕边缘找到入口面板, 使用 ${APP_NAME} 的功能.`,
                )}
                P.S 需要刷新网页
              </>
            }
          />
          <CheckboxSettingItem
            configPath={'multiSelect.showIcon'}
            label='「多选」按钮'
            tooltip='是否显示「多选」按钮'
          />
          <CheckboxSettingItem
            configPath={'showBackForwardButtons'}
            label='「后退 / 前进」按钮'
            tooltip='是否显示「后退 / 前进」按钮'
          />
        </div>
      </SettingsGroup>

      {/* 布局 */}
      <SettingsGroup
        title={
          <>
            布局
            <AntdTooltip title='透视'>
              <IconTablerEyeSearch
                ref={peekIconRef}
                title='透视'
                className={clsx(
                  'ml-1.5 size-1em cursor-pointer b-1px b-transparent rounded-md b-solid p-2px hover:b-gate-primary',
                  { peeking: peekIconHovering },
                )}
              />
            </AntdTooltip>
          </>
        }
        resetSettingPaths={[
          'grid.useCustomGrid',
          'grid.cardMinWidth',
          'grid.enableForceColumn',
          'grid.forceColumnCount',

          'enableSidebar',
          'sidebarAlign',

          'grid.gridDisplayMode',
          'grid.twoColumnModeAlign',
        ]}
      >
        <div className={sharedClassNames.settingsLine}>
          <CheckboxSettingItem
            configPath='grid.useCustomGrid'
            label='使用自定义网格配置'
            tooltip={
              <>
                网格配置指: 网格宽度, 间距, 列数等. <br />
                {explainForFlag(
                  <>使用 {APP_NAME} 自定义网格配置: 宽度为90%; 可跟随 Bilibili-Evolved 自定义顶栏配置</>,
                  <>使用 bili-feed4 版本B站首页默认的网格配置</>,
                )}
              </>
            }
          />

          <div className='flex items-center gap-x-1 px-6px'>
            <AntdTooltip
              title={
                <>
                  如果期望显示更多的列, 可以调小这个值; <br />
                  如果期望显示更少的列, 可以调大这个值; <br />
                  手动设置列数时, 这个值不起作用. <br />
                  <CustomKbd>Alt / Opt</CustomKbd> + <CustomKbd>上下键</CustomKbd>可调整
                </>
              }
            >
              <span className='cursor-pointer'>视频卡片最小宽度</span>
            </AntdTooltip>
            <InputNumber
              disabled={!useCustomGrid || enableForceColumn}
              value={cardMinWidth}
              onChange={(val) => {
                if (val) settings.grid.cardMinWidth = val
              }}
              min={150}
              max={450}
              step={10}
              size='small'
              className='w-75px'
            />
          </div>

          <div className='flex items-center px-6px'>
            <CheckboxSettingItem
              disabled={!useCustomGrid}
              configPath='grid.enableForceColumn'
              label='手动设置列数'
              tooltip={<>手动设置列数</>}
            />
            {useCustomGrid && enableForceColumn && (
              <InputNumber
                value={forceColumnCount}
                onChange={(val) => {
                  if (val) {
                    settings.grid.forceColumnCount = val
                  }
                }}
                min={0}
                max={10}
                step={1}
                size='small'
                className='w-50px'
              />
            )}
          </div>
        </div>

        <div className='flex items-center gap-x-4px'>
          <CheckboxSettingItem
            configPath='enableSidebar'
            label='使用侧边栏'
            tooltip={explainForFlag('使用侧边栏(如动态 分组/UP 选择)', '使用下拉面板')}
          />
          <Radio.Group
            disabled={!enableSidebar}
            buttonStyle='solid'
            size='small'
            value={sidebarAlign}
            onChange={(e) => void (settings.sidebarAlign = e.target.value)}
          >
            <Radio.Button value={ESidebarAlign.Left} className='inline-flex-center'>
              <IconMaterialSymbolsAlignHorizontalLeft className='size-16px' />
            </Radio.Button>
            <Radio.Button value={ESidebarAlign.Right} className='inline-flex-center'>
              <IconMaterialSymbolsAlignHorizontalRight className='size-16px' />
            </Radio.Button>
          </Radio.Group>
        </div>

        <div className='flex items-center'>
          网格显示模式
          <GridDisplayModeSwitcher className='ml-xl' />
        </div>
      </SettingsGroup>

      {/* 样式 */}
      <SettingsGroup
        title='样式'
        resetSettingPaths={[
          'style.general.popoverBorderColorUseColorPrimary',
          'style.pureRecommend.useStickyTabbar',
          'style.pureRecommend.stickyTabbarShadow',
          'grid.useCustomGrid',
          'style.pureRecommend.useWhiteBackground',
          'style.pureRecommend.hideTopChannel',
        ]}
      >
        <div className={sharedClassNames.settingsLine}>
          <CheckboxSettingItem
            configPath='style.general.popoverBorderColorUseColorPrimary'
            label='下拉面板使用主题色边框'
          />
        </div>

        <div>
          <div className='flex items-center text-1.2em'>全屏推荐</div>
          <div className={sharedClassNames.settingsLine}>
            <CheckboxSettingItem
              configPath='style.pureRecommend.useStickyTabbar'
              label='固定 Tab 栏'
              tooltip={explainForFlag('Tab 栏会吸附在顶栏下方', 'Tab 栏会随页面一起滚动')}
            />
            <CheckboxSettingItem
              disabled={!style.pureRecommend.useStickyTabbar}
              configPath='style.pureRecommend.stickyTabbarShadow'
              label='固定 Tab 栏时添加边框 & 阴影'
              tooltip={explainForFlag('Tab 栏在吸附状态下: 加宽, 添加边框 & 阴影', '不改变')}
            />
            <CheckboxSettingItem
              configPath='style.pureRecommend.useWhiteBackground'
              label='使用纯白背景'
              tooltip={
                <>
                  {explainForFlag('纯白背景', '浅灰色背景')}
                  仅影响白色/浅色模式
                </>
              }
            />
            <CheckboxSettingItem configPath={'style.pureRecommend.hideTopChannel'} label='隐藏顶部分区和Banner' />
          </div>
        </div>
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
      >
        <div className={sharedClassNames.settingsLine}>
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
        </div>
      </SettingsGroup>
    </div>
  )
}
