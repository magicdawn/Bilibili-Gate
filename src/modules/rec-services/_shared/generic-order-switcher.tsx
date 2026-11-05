import { useMemoizedFn } from 'ahooks'
import { Button, Dropdown, type DropdownProps } from 'antd'
import clsx from 'clsx'
import { toMerged } from 'es-toolkit'
import { useMemo, useState, type ComponentRef, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { buttonOpenCss, usePopoverBorderStyle } from '$common/emotion-css'
import { HelpInfo } from '$components/_base/HelpInfo'
import { clsAntdButton, PrimaryBgContentDivider } from '$components/fragments'
import { defineAntMenus } from '$modules/antd'
import { soloShiftKey } from '$modules/hotkey'
import type { DropdownSemanticType } from 'antd/es/dropdown/dropdown'
import type { Merge } from 'type-fest'

export type GenericOrderSwitcherProps<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  list: (T | 'divider')[]
  listDisplayConfig: Record<T, { icon?: ReactNode; label?: ReactNode }>
  // classNames & styles: limit to object only, functions not supported
  dropdownProps?: Partial<Merge<DropdownProps, DropdownSemanticType>>
  extraHelpInfo?: ReactNode
  $ref?: RefObject<ComponentRef<'span'> | null>
}

export const GenericOrderSwitcher = function <T extends string | number>({
  value,
  onChange,
  disabled,
  list,
  listDisplayConfig,
  dropdownProps,
  extraHelpInfo,
  $ref,
}: GenericOrderSwitcherProps<T>) {
  const { icon, label } = listDisplayConfig[value]

  const onToggle = useMemoizedFn((e: MouseEvent) => {
    const allowed = list.filter((x) => x !== 'divider')
    const index = allowed.indexOf(value)
    if (index === -1) return
    const nextIndex = (index + (e.shiftKey ? -1 : 1) + allowed.length) % allowed.length
    const next = allowed[nextIndex] as T
    onChange(next)
  })

  const dropdownMenuItems = useMemo(() => {
    return defineAntMenus(
      list.map((x) => {
        if (x === 'divider') return { type: 'divider' } // divider
        const { icon, label } = listDisplayConfig[x]
        return {
          key: x,
          icon,
          label,
          onClick: () => onChange(x),
        }
      }),
    )
  }, [list, listDisplayConfig, onChange])

  const [open, setOpen] = useState(false)

  const dropdownBorderStyle = usePopoverBorderStyle()
  const dropdownMergedStyles: DropdownSemanticType = useMemo(() => {
    return {
      classNames: {
        root: 'text-13px',
        item: 'justify-start',
        itemContent: 'flex-shrink-0',
        ...dropdownProps?.classNames,
      },

      // nested: 不能简单 assign
      styles: toMerged(
        {
          menu: dropdownBorderStyle,
        },
        dropdownProps?.styles ?? {},
      ),
    }
  }, [dropdownProps?.className, dropdownProps?.styles, dropdownBorderStyle])

  return (
    <span className='inline-flex items-center' ref={$ref}>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        menu={{
          items: dropdownMenuItems,
          selectedKeys: [value.toString()],
        }}
        placement='bottomRight'
        {...dropdownProps}
        {...dropdownMergedStyles}
      >
        <Button
          className={clsx(clsAntdButton, 'px-3')}
          css={[open && buttonOpenCss]}
          disabled={disabled}
          onClick={onToggle}
        >
          {icon}
          {label}
        </Button>
      </Dropdown>
      <HelpInfo>
        {extraHelpInfo}
        {extraHelpInfo && <PrimaryBgContentDivider />}
        操作说明: <br />
        1. 点击/下拉切换 <br />
        2. 按住 {soloShiftKey} 键点击逆序切换 <br />
      </HelpInfo>
    </span>
  )
}
