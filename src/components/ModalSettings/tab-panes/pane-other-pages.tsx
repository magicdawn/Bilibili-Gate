import { APP_NAME } from '$common'
import { kbdClassName } from '$common/shared-ui'
import { CheckboxSettingItem } from '../setting-item'
import { SettingsGroup, sharedClassNames } from './shared'

export function TabPaneOtherPages() {
  return (
    <div className={sharedClassNames.tabPane}>
      <SettingsGroup title='视频播放页'>
        <CheckboxSettingItem
          configPath='fav.useCustomFavPicker.onPlayPage'
          label={`使用自定义收藏弹窗`}
          tooltip={
            <>
              使用「{APP_NAME}」提供的选择收藏夹弹窗 <br />
              <ul className='ml-20px list-circle'>
                <li>支持拼音搜索, 帮你快速找到收藏夹</li>
                <li>
                  <span className='flex-v-center'>
                    支持从收藏夹图标 或 快捷键
                    <kbd className={clsx(kbdClassName, 'mx-1 h-14px py-0 line-height-14px')}>e</kbd>
                    触发
                  </span>
                </li>
              </ul>
            </>
          }
        />
      </SettingsGroup>

      <SettingsGroup title='搜索页'>
        <CheckboxSettingItem
          configPath='videoCard.videoPreview.addTo.searchPage'
          label='浮动预览: 添加到「搜索页」'
          tooltip={<>在搜索页的视频也添加「浮动预览」</>}
        />
      </SettingsGroup>
    </div>
  )
}
