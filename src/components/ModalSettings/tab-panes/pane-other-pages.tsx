import { APP_NAME } from '$common'
import { kbdClassName } from '$common/shared-classnames'
import { CheckboxSettingItem } from '../setting-item'
import { SettingsGroup, sharedCss } from './shared'

export function TabPaneOtherPages() {
  return (
    <div css={sharedCss.tabPane}>
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
                    <kbd className={clsx(kbdClassName, 'mx-1 h-14px line-height-14px py-0')}>e</kbd>
                    触发
                  </span>
                </li>
              </ul>
            </>
          }
        />
      </SettingsGroup>
    </div>
  )
}
