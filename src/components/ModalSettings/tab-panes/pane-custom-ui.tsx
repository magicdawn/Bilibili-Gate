import { Tag } from 'antd'
import { isEqual, pick } from 'es-toolkit'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_NAME } from '$common'
import { antMessage } from '$modules/antd'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import type { Settings } from '$modules/settings'
import { explainForFlag } from '../index.shared'
import { CheckboxSettingItem } from '../setting-item'
import { ResetPartialSettingsButton, SettingsGroup, sharedClassNames } from './shared'

type CardBorderState = Partial<Pick<Settings['style']['videoCard'], 'useBorder' | 'useBorderOnlyOnHover'>>
const borderCycleList: CardBorderState[] = [
  { useBorder: false }, // no border
  { useBorder: true, useBorderOnlyOnHover: true }, // on hover
  { useBorder: true, useBorderOnlyOnHover: false }, // always
]
const borderCycleListLabels = ['「卡片边框」: 禁用', '「卡片边框」: 仅在悬浮时显示', '「卡片边框」: 总是显示']
export function useHotkeyForConfigBorder() {
  // useHotkeyForConfig(['shift.b'], 'styleUseCardBorder', '卡片边框')
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

export function TabPaneCustomUI() {
  const { style } = useSettingsSnapshot()

  const rootClassName = useUnoMerge(
    sharedClassNames.tabPane,
    'flex flex-col flex-wrap content-start gap-x-30px gap-y-10px',
  )

  const itemsContainerClassName = 'flex flex-col gap-y-4px'

  return (
    <div className={rootClassName}>
      {/* 通用 */}
      <SettingsGroup
        title={
          <>
            通用
            <ResetPartialSettingsButton
              className='ml-10px'
              paths={['style.general.popoverBorderColorUseColorPrimary']}
            />
          </>
        }
      >
        <div className={itemsContainerClassName}>
          <CheckboxSettingItem
            configPath='style.general.popoverBorderColorUseColorPrimary'
            label='下拉面板使用主题色边框'
          />
        </div>
      </SettingsGroup>

      {/* 全屏模式 */}
      <SettingsGroup
        title={
          <>
            全屏模式
            <ResetPartialSettingsButton
              className='ml-10px'
              paths={[
                'style.pureRecommend.useStickyTabbar',
                'style.pureRecommend.stickyTabbarShadow',
                'style.pureRecommend.useCustomGrid',
                'style.pureRecommend.useWhiteBackground',
                'style.pureRecommend.hideTopChannel',
              ]}
            />
          </>
        }
      >
        <div className={itemsContainerClassName}>
          <CheckboxSettingItem
            configPath='style.pureRecommend.useStickyTabbar'
            label='全屏模式: 固定 Tab 栏'
            tooltip={explainForFlag('Tab 栏会吸附在顶栏下方', 'Tab 栏会随页面一起滚动')}
          />
          <CheckboxSettingItem
            disabled={!style.pureRecommend.useStickyTabbar}
            configPath='style.pureRecommend.stickyTabbarShadow'
            label='全屏模式: 固定 Tab 栏 : 添加边框 & 阴影'
            tooltip={explainForFlag('Tab 栏在吸附状态下: 加宽, 添加边框 & 阴影', '不改变')}
          />

          <CheckboxSettingItem
            configPath='style.pureRecommend.useCustomGrid'
            label='全屏模式: 使用自定义网格配置'
            tooltip={
              <>
                网格配置指: 网格宽度, 间距, 列数等. <br />
                自定义网格配置: 宽度为90%; 可跟随 Bilibili-Evolved 自定义顶栏配置; 列数: 4 - 10列; 由 {
                  APP_NAME
                } 自定义; <br />
                默认网格配置: bili-feed4 版本B站首页默认的网格配置; 在 Safari 中使用建议取消勾选此项.
              </>
            }
          />

          <CheckboxSettingItem
            configPath='style.pureRecommend.useWhiteBackground'
            label='全屏模式: 使用纯白背景'
            tooltip={explainForFlag('纯白背景', '浅灰色背景')}
          />

          <CheckboxSettingItem
            configPath={'style.pureRecommend.hideTopChannel'}
            label='全屏模式: 隐藏顶部分区和Banner'
          />
        </div>
      </SettingsGroup>

      {/* 视频卡片 */}
      <SettingsGroup
        title={
          <>
            视频卡片
            <ResetPartialSettingsButton
              className='ml-10px'
              paths={[
                'style.videoCard.useBorder',
                'style.videoCard.useBorderOnlyOnHover',
                'style.videoCard.useBoxShadow',
                'useDelayForHover',
              ]}
            />
          </>
        }
      >
        <div className={itemsContainerClassName}>
          <CheckboxSettingItem
            configPath='style.videoCard.useBorder'
            label='使用卡片边框'
            tooltip=<>
              勾选后, 视频卡片会有边框包裹, 更像是一个卡片~ <br />
              整个卡片区域可点击 / 可触发预览 / 可使用右键菜单 <br />
              否则只是封面区域可以 <br />
              使用快捷键 <Tag color='green'>shift+b</Tag> 切换状态
              <br />
              {borderCycleListLabels.map((label) => (
                <Tag color='success' key={label}>
                  {label}
                </Tag>
              ))}
            </>
          />

          <CheckboxSettingItem
            configPath='style.videoCard.useBorderOnlyOnHover'
            label='仅在悬浮时显示'
            disabled={!style.videoCard.useBorder}
            tooltip={explainForFlag('仅在悬浮时显示', '一直显示')}
          />

          <CheckboxSettingItem
            configPath='style.videoCard.useBoxShadow'
            disabled={!style.videoCard.useBorder}
            label='悬浮卡片时使用发光效果'
            tooltip={<>悬浮卡片时使用发光效果, 看起来比较花哨~</>}
          />

          <CheckboxSettingItem configPath='useDelayForHover' label='延迟悬浮预览' tooltip={<>延迟悬浮预览</>} />
        </div>
      </SettingsGroup>
    </div>
  )
}
