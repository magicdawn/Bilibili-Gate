import { useMemoizedFn } from 'ahooks'
import { Button, Dropdown, type DropdownProps } from 'antd'
import clsx from 'clsx'
import { useMemo, useState, type ComponentRef, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { buttonOpenCss, usePopoverBorderStyle } from '$common/emotion-css'
import { TooltipContentDivider } from '$components/_base'
import { HelpInfo } from '$components/_base/HelpInfo'
import { clsAntdButton, kbdClassName } from '$components/fragments'
import { defineAntMenus } from '$modules/antd'

export type GenericOrderSwitcherProps<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  list: (T | 'divider')[]
  listDisplayConfig: Record<T, { icon?: ReactNode; label?: ReactNode }>
  dropdownProps?: Partial<DropdownProps>
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
  return (
    <span className='inline-flex items-center' ref={$ref}>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        menu={{
          items: dropdownMenuItems,
          selectedKeys: [value.toString()],
          styles: { root: dropdownBorderStyle },
        }}
        placement='bottomRight'
        classNames={{
          root: 'text-13px',
          item: 'justify-start',
          itemContent: 'flex-shrink-0',
        }}
        {...dropdownProps}
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
        {extraHelpInfo && <TooltipContentDivider />}
        操作说明: <br />
        1. 点击/下拉切换 <br />
        2. 按住 <kbd className={kbdClassName}>Shift</kbd> 键点击逆序切换 <br />
      </HelpInfo>
    </span>
  )
}
