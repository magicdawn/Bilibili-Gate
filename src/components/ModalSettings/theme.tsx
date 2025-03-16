/**
 * https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json
 *
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/
 */

import { flexCenterStyle } from '$common/emotion-css'
import { HelpInfo } from '$components/_base/HelpInfo'
import { $evolvedThemeColor } from '$header'
import { AntdTooltip } from '$modules/antd/custom'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { css } from '@emotion/react'
import { usePrevious } from 'ahooks'
import { ColorPicker } from 'antd'
import type { Color } from 'antd/es/color-picker'
import { DEFAULT_BILI_PINK_THEME, ThemeGroups, useCurrentTheme } from './theme.shared'

export function ThemesSelect() {
  const activeId = useCurrentTheme().id
  const prevActiveId = usePrevious(activeId)

  // color-picker
  const { colorPickerThemeSelectedColor } = useSettingsSnapshot()
  const [customColor, setCustomColor] = useState<Color | string>(
    colorPickerThemeSelectedColor || DEFAULT_BILI_PINK_THEME.colorPrimary,
  )
  const customColorHex = useMemo(() => {
    return typeof customColor === 'string' ? customColor : customColor.toHexString()
  }, [customColor])

  useMount(() => {
    $evolvedThemeColor.updateThrottled()
  })

  return (
    <div>
      {ThemeGroups.map(({ name, themes, tooltip }) => {
        return (
          <Fragment key={name}>
            <div
              css={css`
                font-size: 1.5em;
                display: flex;
                align-items: center;
                margin-top: 10px;
              `}
            >
              {name}
              <HelpInfo
                className='size-16px'
                tooltipProps={{ color: 'rgba(0, 0, 0, 0.85)' }} // 默认使用 colorPrimary, 链接可能看不清
              >
                {tooltip}
              </HelpInfo>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
              {themes.map((t) => {
                const isActive = activeId === t.id
                const isCustom = t.isCustom

                // 反应 selected-false -> selected-true 的转变
                // 初始 prevActiveId 为 undefined
                const useAnimation = !!prevActiveId && prevActiveId !== t.id

                const innerSize = 30
                const outerSize = innerSize + 8

                let previewWrapper: ReactNode = (
                  <div
                    className='preview-wrapper'
                    css={[
                      css`
                        aspect-ratio: 1;
                        width: ${outerSize}px;
                        border: 2px solid transparent;
                        border-radius: 50%;
                        /* border-radius: 6px; */
                        margin: 0 auto;
                        font-size: 0;
                      `,
                      flexCenterStyle,
                      isActive &&
                        css`
                          border-color: ${t.colorPrimary};
                        `,
                    ]}
                  >
                    <div
                      className='preview'
                      css={[
                        css`
                          aspect-ratio: 1;
                          width: ${innerSize}px;
                          background-color: ${isCustom ? customColorHex : t.colorPrimary};
                          border-radius: 50%;
                          color: #fff;
                          /* border-radius: 4px; */
                        `,
                        flexCenterStyle,
                      ]}
                    >
                      {isActive && <IconAnimatedChecked size={18} useAnimation={useAnimation} />}
                    </div>
                  </div>
                )

                if (t.isCustom) {
                  previewWrapper = (
                    <ColorPicker
                      // placement='topLeft'
                      value={customColor}
                      onChange={(c) => setCustomColor(c)}
                      onOpenChange={(open) => {
                        // 关闭时
                        if (!open) {
                          updateSettings({
                            colorPickerThemeSelectedColor: customColorHex,
                          })
                        }
                      }}
                    >
                      {previewWrapper}
                    </ColorPicker>
                  )
                }

                let el = (
                  <div
                    css={css`
                      min-width: 60px;
                      text-align: center;
                      cursor: pointer;
                    `}
                    onClick={(e) => {
                      updateSettings({ theme: t.id })
                    }}
                  >
                    {previewWrapper}
                    {t.name}
                  </div>
                )

                // wrap tooltip
                if (t.tooltip) {
                  el = <AntdTooltip title={t.tooltip}>{el}</AntdTooltip>
                }

                // wrap with key
                el = <Fragment key={t.id}>{el}</Fragment>

                return el
              })}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
