/**
 * https://github.com/lyswhut/lx-music-desktop/blob/v2.2.2/src/common/theme/index.json
 *
 * Apache License
 * Version 2.0, January 2004
 * http://www.apache.org/licenses/
 */

import { css } from '@emotion/react'
import { usePrevious } from 'ahooks'
import { ColorPicker } from 'antd'
import { HelpInfo } from '$components/_base/HelpInfo'
import { $evolvedThemeColor } from '$header'
import { AntdTooltip } from '$modules/antd/custom'
import { IconAnimatedChecked } from '$modules/icon/animated-checked'
import { updateSettings, useSettingsSnapshot } from '$modules/settings'
import { DEFAULT_BILI_PINK_THEME, EXTRA_TOOLTIP, ThemeGroups, useCurrentTheme } from './theme.shared'
import type { Color } from 'antd/es/color-picker'

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
            <div className='mt-2 flex items-center text-size-1.5em'>
              {name}
              <HelpInfo className='size-16px' useBlackBg>
                {tooltip}
              </HelpInfo>
            </div>
            <div className='flex flex-wrap gap-x-5px gap-y-2px'>
              {themes.map((t) => {
                const isActive = activeId === t.id
                const isCustom = t.isCustom

                // 反应 selected-false -> selected-true 的转变
                // 初始 prevActiveId 为 undefined
                const useAnimation = !!prevActiveId && prevActiveId !== t.id

                const innerSize = 28
                const outerSize = innerSize + 8

                let previewWrapper: ReactNode = (
                  <div
                    data-role='preview-wrapper'
                    style={{ width: outerSize }}
                    className={clsx(
                      'mx-auto my-0 aspect-1 b-2px rounded-full b-solid',
                      isActive ? 'b-gate-primary' : 'b-transparent',
                      'flex items-center justify-center text-size-0',
                    )}
                  >
                    <div
                      data-role='preview'
                      className='aspect-1 flex items-center justify-center rounded-full text-white'
                      css={css`
                        width: ${innerSize}px;
                        background-color: ${isCustom ? customColorHex : t.colorPrimary};
                      `}
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
                    className='min-w-60px cursor-pointer text-center'
                    onClick={(e) => {
                      updateSettings({ theme: t.id })
                    }}
                  >
                    {previewWrapper}
                    {t.name}
                  </div>
                )

                // wrap tooltip
                if (t.tooltip || EXTRA_TOOLTIP[t.id]) {
                  el = (
                    <AntdTooltip
                      title={
                        <>
                          {t.tooltip}
                          {EXTRA_TOOLTIP[t.id]}
                        </>
                      }
                      color={t.colorPrimary}
                    >
                      {el}
                    </AntdTooltip>
                  )
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
