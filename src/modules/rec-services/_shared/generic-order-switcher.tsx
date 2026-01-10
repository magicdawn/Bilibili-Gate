import { useMemoizedFn } from 'ahooks'
import { Button, Divider, Dropdown, type DropdownProps } from 'antd'
import { useMemo, useState, type ElementRef, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { buttonOpenCss, usePopoverBorderStyle } from '$common/emotion-css'
import { HelpInfo } from '$components/_base/HelpInfo'
import { defineAntMenus } from '$modules/antd'

export type GenericOrderSwitcherProps<T extends string | number> = {
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  list: (T | 'divider')[]
  listDisplayConfig: Record<T, { icon?: ReactNode; label?: ReactNode }>
  dropdownProps?: Partial<DropdownProps>
  extraHelpInfo?: ReactNode
  $ref?: RefObject<ElementRef<'span'>>
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
          onClick={onToggle}
          css={[open && buttonOpenCss]}
          icon={icon}
          className='gap-8px px-16px'
          disabled={disabled}
        >
          {label}
        </Button>
      </Dropdown>
      <HelpInfo>
        {extraHelpInfo}
        {extraHelpInfo && <Divider variant='solid' className='my-7px' />}
        操作说明: <br />
        1. 点击/下拉切换 <br />
        2. 按住 <kbd>Shift</kbd> 键点击逆序切换 <br />
      </HelpInfo>
    </span>
  )
}
