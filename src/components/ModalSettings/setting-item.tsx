/* oxlint-disable react/rules-of-hooks */

import { Button, Checkbox, Switch } from 'antd'
import { get, set } from 'es-toolkit/compat'
import { forwardRef, useCallback, type ComponentProps, type ElementRef, type ReactNode, type Ref } from 'react'
import { AntdTooltip } from '$modules/antd/custom'
import { settings, useSettingsSnapshot, type BooleanSettingsPath } from '$modules/settings'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'

function useBooleanSettingsPath(configPath: BooleanSettingsPath, extraAction?: (val: boolean) => void) {
  const snap = useSettingsSnapshot()
  const checked = !!get(snap, configPath, false)
  const onChange = useCallback((val: boolean) => {
    set(settings, configPath, val)
    extraAction?.(val)
  }, [])
  const checkboxOnChange = useCallback((e: CheckboxChangeEvent) => {
    onChange(e.target.checked)
  }, [])
  const onToggle = useCallback(() => {
    onChange(!get(settings, configPath, false))
  }, [])
  return { checked, onChange, checkboxOnChange, onToggle }
}

type FlagSettingItemProps = {
  configPath: BooleanSettingsPath
  label?: string | ((val: boolean) => ReactNode)
  extraAction?: (val: boolean) => void | Promise<void>
  tooltip?: ReactNode
  tooltipProps?: Omit<ComponentProps<typeof AntdTooltip>, 'title' | 'children'>
  as?: 'checkbox' | 'switch'
  checkboxProps?: ComponentProps<typeof Checkbox>
  switchProps?: ComponentProps<typeof Switch>
}

const __FlagSettingItem = forwardRef<ElementRef<typeof Checkbox> | ElementRef<typeof Switch>, FlagSettingItemProps>(
  function ({ configPath, label, extraAction, tooltip, tooltipProps, as, checkboxProps, switchProps }, ref) {
    const { checked, onChange, checkboxOnChange } = useBooleanSettingsPath(configPath, extraAction)

    const wrapTooltip = (children: ReactNode) => {
      if (!tooltip) return children
      return (
        <AntdTooltip {...tooltipProps} title={tooltip}>
          {children}
        </AntdTooltip>
      )
    }

    let usingLabel: ReactNode
    if (typeof label === 'function') {
      usingLabel = label(checked)
    } else {
      usingLabel = (label ?? configPath) || null // Q: 这是干什么? A: 允许 label 空字符串, 空字符串时转成 null
    }

    if (as === 'checkbox') {
      let label: ReactNode = <span style={{ userSelect: 'none' }}>{usingLabel}</span>
      if (tooltip) label = wrapTooltip(label)
      return (
        <Checkbox
          {...checkboxProps}
          checked={checked}
          onChange={checkboxOnChange}
          ref={ref as Ref<ElementRef<typeof Checkbox>>}
        >
          {label}
        </Checkbox>
      )
    }

    if (as === 'switch') {
      let content: ReactNode = (
        <Switch {...switchProps} checked={checked} onChange={onChange} ref={ref as Ref<ElementRef<typeof Switch>>} />
      )
      if (tooltip) content = wrapTooltip(content)
      return content
    }
  },
)

export const CheckboxSettingItem = forwardRef(function (
  {
    configPath,
    label,
    extraAction,
    tooltip,
    tooltipProps,
    ...otherProps
  }: {
    configPath: BooleanSettingsPath
    label?: FlagSettingItemProps['label']
    extraAction?: FlagSettingItemProps['extraAction']
    tooltip?: ReactNode
    tooltipProps?: FlagSettingItemProps['tooltipProps']
  } & ComponentProps<typeof Checkbox>,
  ref: Ref<ElementRef<typeof Checkbox>>,
) {
  return (
    <__FlagSettingItem
      {...{ ref, configPath, label, extraAction, tooltip, tooltipProps, as: 'checkbox', checkboxProps: otherProps }}
    />
  )
})

export const SwitchSettingItem = forwardRef(function SwitchSettingItem(
  {
    configPath,
    extraAction,
    tooltip,
    tooltipProps,
    ...otherProps
  }: {
    configPath: BooleanSettingsPath
    extraAction?: FlagSettingItemProps['extraAction']
    tooltip?: ReactNode
    tooltipProps?: FlagSettingItemProps['tooltipProps']
  } & ComponentProps<typeof Switch>,
  ref: Ref<ElementRef<typeof Switch>>,
) {
  return (
    <__FlagSettingItem
      {...{
        ref,
        configPath,
        extraAction,
        tooltip,
        tooltipProps,
        as: 'switch',
        switchProps: otherProps,
      }}
    />
  )
})

export function ButtonSettingItem({
  configPath,
  tooltip,
  tooltipProps,
  extraAction,
  checkedChildren,
  unCheckedChildren,
}: {
  configPath: BooleanSettingsPath
  tooltip?: ReactNode
  tooltipProps?: FlagSettingItemProps['tooltipProps']
  extraAction?: (val: boolean) => void
  checkedChildren?: ReactNode
  unCheckedChildren?: ReactNode
}) {
  const { checked, onToggle } = useBooleanSettingsPath(configPath, extraAction)
  return (
    <AntdTooltip title={tooltip} {...tooltipProps}>
      <Button onClick={onToggle}>
        <span className='inline-flex items-center justify-center gap-4px line-height-[1]'>
          {checked ? (checkedChildren ?? '✅') : (unCheckedChildren ?? '❎')}
        </span>
      </Button>
    </AntdTooltip>
  )
}
